from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from ocr_utils import run_ocr_tesseract, run_ocr_easyocr_text_only
from parse_utils import parse_nutrition_lines, parse_nutrition_easyocr
from text_norm import nutrition_normalize
from preprocess import postprocess_text

app = FastAPI(title="Medi_Talk OCR API")

# CORS 설정 (외부 앱에서 API 호출 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://medimedi.p-e.kr:65002",  # 접속주소
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# 내부 유틸
# -----------------------------
def _read_pil_from_upload(data: bytes) -> Image.Image:
    """업로드 바이너리를 PIL 이미지(RGB)로 변환"""
    return Image.open(io.BytesIO(data)).convert("RGB")

def _ocr_raw_text(pil: Image.Image, *, lang: str, engine: str) -> tuple[str, str]:
    """
    OCR 엔진 공통 래퍼
    반환: (engine_used, raw_text)
    """
    e = (engine or "easyocr").lower()
    if e == "tesseract":
        return "tesseract", run_ocr_tesseract(pil, lang=lang)
    # default: easyocr
    return "easyocr", run_ocr_easyocr_text_only(pil, lang=lang)

# -----------------------------
# 헬스체크
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------------
# 일반 OCR (텍스트만)
# -----------------------------
@app.post("/ocr")
async def ocr_image(
    file: UploadFile = File(...),
    lang: str = "kor+eng",
    engine: str = "easyocr",
):
    try:
        data = await file.read()
        pil = _read_pil_from_upload(data)
        engine_used, raw_text = _ocr_raw_text(pil, lang=lang, engine=engine)

        # 공통 후처리(일반): postprocess_text
        text = postprocess_text(raw_text)

        return JSONResponse({"engine": engine_used, "lang": lang, "text": text})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# -----------------------------
# 영양성분 OCR (구조화)
# -----------------------------
@app.post("/ocr/nutrition")
async def ocr_nutrition(
    file: UploadFile = File(...),
    lang: str = "kor+eng",
    engine: str = "easyocr",
):
    try:
        data = await file.read()
        pil = _read_pil_from_upload(data)

        e = (engine or "easyocr").lower()
        if e == "tesseract":
            # 1) 텍스트 추출
            engine_used, raw_text = _ocr_raw_text(pil, lang=lang, engine="tesseract")
            # 2) 구조화 파싱 (라인 기반) — 내부에서 nutrition 정규화 수행
            rows = parse_nutrition_lines(raw_text)
            # 3) 응답용 텍스트(정규화본) — 엔진에 상관없이 동일 규칙으로 제공
            text = nutrition_normalize(raw_text)
        else:
            # easyocr: 박스 기반 파서가 텍스트/rows 동시 반환
            raw_text, rows = parse_nutrition_easyocr(pil, lang=lang)  # raw_text는 이미 정규화본(text_pp)
            text = raw_text
            engine_used = "easyocr"

        return JSONResponse({
            "engine": engine_used,
            "lang": lang,
            "text": text,   # ← /ocr와 동일 키로 통일
            "rows": rows
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
