from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import cv2
import pytesseract
import io
import os
import torch
import easyocr
import re
import math
from typing import List, Dict, Optional

# ------------------------
# FastAPI
# ------------------------
app = FastAPI(title="Medi_Talk OCR API")

@app.get("/health")
def health():
    return {"status": "ok"}

# ------------------------
# EasyOCR 준비 (언어/리더 캐시)
# ------------------------
_EASYOCR_READER_CACHE: Dict[str, easyocr.Reader] = {}

def _map_langs_for_easyocr(lang: str) -> List[str]:
    lang = (lang or "").lower()
    has_kor = "kor" in lang or "ko" in lang
    has_eng = "eng" in lang or "en" in lang
    if has_kor and has_eng:
        return ["ko", "en"]
    if has_kor:
        return ["ko"]
    return ["en"]

def _get_easyocr_reader(lang: str) -> easyocr.Reader:
    langs = _map_langs_for_easyocr(lang)
    key = ",".join(langs) + ("|gpu" if torch.cuda.is_available() else "|cpu")
    if key not in _EASYOCR_READER_CACHE:
        _EASYOCR_READER_CACHE[key] = easyocr.Reader(langs, gpu=torch.cuda.is_available())
    return _EASYOCR_READER_CACHE[key]

# ------------------------
# 전처리 (EasyOCR 친화: deskew + 대비 강화 + 샤프닝)
# ------------------------
def preprocess_for_easyocr(img_rgb: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edges = cv2.dilate(edges, np.ones((3,3), np.uint8), iterations=1)

    angle_deg = 0.0
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=120,
                            minLineLength=max(30, int(0.15*min(gray.shape))),
                            maxLineGap=10)
    if lines is not None and len(lines) > 0:
        angles = []
        for x1,y1,x2,y2 in lines.reshape(-1,4):
            dx = x2 - x1
            if dx == 0:
                continue
            ang = math.degrees(math.atan2(y2 - y1, dx))
            if -25 <= ang <= 25:
                angles.append(ang)
        if angles:
            angles.sort()
            angle_deg = float(np.median(angles))

    if abs(angle_deg) > 0.2:
        h, w = gray.shape
        M = cv2.getRotationMatrix2D((w/2, h/2), angle_deg, 1.0)
        img_rgb = cv2.warpAffine(img_rgb, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    L, A, B = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    L = clahe.apply(L)
    lab = cv2.merge([L, A, B])
    img_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

    blur = cv2.GaussianBlur(img_rgb, (0,0), sigmaX=1.0)
    img_rgb = cv2.addWeighted(img_rgb, 1.25, blur, -0.25, 0)
    return img_rgb

# ------------------------
# 후처리 (안전한 정리 + 최소 보정)
# ------------------------
def clean_ocr_text(text: str) -> str:
    lines = text.splitlines()
    out = []
    for line in lines:
        line = re.sub(r"[|;+:{}!]", " ", line)    # 잡기호 제거
        line = re.sub(r"\s+", " ", line).strip()  # 공백 정리
        if line:
            out.append(line)
    return "\n".join(out)

def normalize_ocr_units(text: str) -> str:
    # 강제 mg/g 치환은 하지 않음. 흔한 mg 오인식만 보정.
    text = re.sub(r'(?i)\bm\s*9\b', 'mg', text)
    text = re.sub(r'(?i)\bm\s*q\b', 'mg', text)
    return text

def reflow_for_readability(text: str) -> str:
    """
    값은 건드리지 않고 '라인 경계'만 만들어 가독성 향상:
    - (숫자)+(%) 또는 (숫자)+96 다음에 개행: 예) 26% / 2696 → 26%\n
    - 대표 영양소 키워드 앞에서 줄바꿈
    - 공백/개행 정리
    """
    # 1) 퍼센트/96 뒤 줄바꿈
    text = re.sub(rf'({_NUM})\s*(%|96)\b', r'\1%\n', text)

    # 2) 영양소 키워드 앞에서 줄바꿈 (줄 시작은 제외)
    #    콜레스 언급은 '콜레스', '콜레스테롤' 모두 잡기
    keywords = r'(열량|탄수화물|단백질|지방|당류|포화|트랜스|콜레스\w*|나트륨|비타민[ A-Za-z0-9]*|엽산|칼[슘숨]|아연|철)'
    text = re.sub(rf'(?<!^)\s+(?={keywords}\b)', '\n', text)

    # 3) 공백/개행 정리
    lines = [re.sub(r'\s+', ' ', ln).strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    return "\n".join(lines)

def postprocess_text(text: str) -> str:
    text = clean_ocr_text(text)
    text = normalize_ocr_units(text)
    text = reflow_for_readability(text)   # ← 추가
    return text

# ------------------------
# 공통 OCR 실행
# ------------------------
def run_ocr_tesseract(pil: Image.Image, lang: str) -> str:
    os.environ.setdefault("TESSDATA_PREFIX", "/usr/share/tesseract-ocr/5/tessdata")
    img_bgr = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    config = "--oem 3 --psm 6 -c preserve_interword_spaces=1 -c user_defined_dpi=300"
    return pytesseract.image_to_string(img_bgr, lang=lang, config=config)

def run_ocr_easyocr(pil: Image.Image, lang: str) -> str:
    img = np.array(pil)
    h, w = img.shape[:2]
    if max(h, w) < 1600:
        img = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    img = preprocess_for_easyocr(img)
    reader = _get_easyocr_reader(lang)
    lines = reader.readtext(img, detail=0, paragraph=True)
    return "\n".join([ln.strip() for ln in lines if ln.strip()])

# ------------------------
# 라우트: 원문 텍스트 반환
# ------------------------
@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...), lang: str = "kor+eng", engine: str = "easyocr"):
    try:
        data = await file.read()
        pil = Image.open(io.BytesIO(data)).convert("RGB")

        if engine.lower() == "tesseract":
            text = run_ocr_tesseract(pil, lang=lang)
            engine_used = "tesseract"
        else:
            text = run_ocr_easyocr(pil, lang=lang)
            engine_used = "easyocr"

        text = postprocess_text(text)
        return JSONResponse({"engine": engine_used, "lang": lang, "text": text})

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ------------------------
# 영양성분 표 파싱 유틸
# ------------------------
_NUM = r"\d+(?:[.,]\d+)?"
# 단위 확장: mg, g, kcal, ug/µg/μg, ugre/µgre/μgre/RE, IU
_UNIT = r"(?:mg|g|kcal|ug|µg|μg|ugre|µgre|μgre|re|iu)"
_PERCENT_RGX = rf"({_NUM})\s*(?:%|％|96)\b"

def _norm_unit(u: str) -> str:
    u = u.replace("㎎", "mg").replace("그램", "g").replace("µg", "ug").replace("μg", "ug")
    u = u.lower()
    # 'ugre/µgre/μgre' → 'ugRE', 're' → 'RE', 'iu' → 'IU'
    if u in ("ugre", "µgre", "μgre"):
        return "ugRE"
    if u == "re":
        return "RE"
    if u == "iu":
        return "IU"
    return u

def normalize_for_nutrition(text: str) -> str:
    """
    값 왜곡 없이 파싱 성공률을 올리기 위한 안전한 정규화:
    - 전각 퍼센트(％) → %
    - 숫자 다음 '96' → '%' (예: 2696 → 26%)
    - 숫자 포함 토큰에서 전형적 혼동: O/D→0, i/l/I→1, Z→7, S→5, B→8
    """
    text = text.replace("％", "%")
    text = re.sub(rf"({_NUM})\s*96\b", r"\1%", text)

    def _fix_token(tok: str) -> str:
        if not re.search(r"[0-9]", tok):
            return tok
        trans = str.maketrans({
            "O": "0", "o": "0", "D": "0",
            "i": "1", "l": "1", "I": "1",
            "Z": "7", "S": "5", "B": "8",
        })
        return tok.translate(trans)

    fixed_lines = []
    for line in text.splitlines():
        toks = line.split()
        fixed_toks = [_fix_token(t) for t in toks]
        fixed_lines.append(" ".join(fixed_toks))
    return "\n".join(fixed_lines)

def parse_nutrition_lines(text: str) -> List[Dict[str, Optional[str]]]:
    """
    기준치/함량이 없어도 버리지 않음:
    - {"영양성분": 이름, "함량": Optional[str], "기준치": Optional[str]}
    """
    # ★ 파싱 전 안전 정규화
    text = normalize_for_nutrition(text)

    rows: List[Dict[str, Optional[str]]] = []
    header_keywords = ["영양성분", "기준치", "분량", "영양소 기준치", "열량", "칼로리", "1회"]

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue

        # 헤더/설명 라인 제외 (필요하면 주석 처리)
        if any(k in line for k in header_keywords):
            continue

        # 1) 기준치(%) (없으면 None)
        pm = re.search(__PERCENT_RGX, line, flags=re.IGNORECASE)
        percent_str: Optional[str] = None
        line_wo_pct = line
        if pm:
            percent_str = f"{pm.group(1)}%"
            start, end = pm.span()
            line_wo_pct = (line[:start] + " " + line[end:]).strip()

        # 2) 함량(수치+단위) (없으면 None)
        amount_str: Optional[str] = None
        m_amount = re.search(rf"({_NUM})\s*({_UNIT})\b", line_wo_pct, flags=re.IGNORECASE)
        if m_amount:
            val = m_amount.group(1).replace(",", "")
            unit = _norm_unit(m_amount.group(2))
            amount_str = f"{val} {unit}"
            name_part = (line_wo_pct[:m_amount.start()] + " " + line_wo_pct[m_amount.end():]).strip()
        else:
            # 단위 없는 숫자는 우선 제거해서 이름만 확보
            name_part = re.sub(rf"\b{_NUM}\b", " ", line_wo_pct)

        # 3) 이름 정리
        name_part = re.sub(r"\s+", " ", name_part).strip()
        if not name_part:
            fallback = re.sub(r"[|;+:{}!]", " ", line)
            fallback = re.sub(rf"\b{_NUM}\b", " ", fallback)
            name_part = re.sub(r"\s+", " ", fallback).strip()
        if not name_part:
            continue

        rows.append({"영양성분": name_part, "함량": amount_str, "기준치": percent_str})

    return rows

# ------------------------
# 라우트: 영양성분/함량/기준치 구조화
# ------------------------
@app.post("/ocr/nutrition")
async def ocr_nutrition(file: UploadFile = File(...), lang: str = "kor+eng", engine: str = "easyocr"):
    try:
        data = await file.read()
        pil = Image.open(io.BytesIO(data)).convert("RGB")

        if engine.lower() == "tesseract":
            text = run_ocr_tesseract(pil, lang=lang)
            engine_used = "tesseract"
        else:
            text = run_ocr_easyocr(pil, lang=lang)
            engine_used = "easyocr"

        text = postprocess_text(text)
        rows = parse_nutrition_lines(text)

        return JSONResponse({
            "engine": engine_used,
            "lang": lang,
            "raw_text": text,
            "rows": rows
        })

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

