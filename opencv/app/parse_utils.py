# app/parse_utils.py
import re
import difflib
from typing import List, Dict, Optional, Tuple

from ocr_utils import run_ocr_easyocr_with_boxes
from nutrients_dict import NUTRIENT_SYNONYMS
from units_dict import UNIT_REGEX, normalize_unit, is_unit
from constants import NUM_PATTERN, PERCENT_PATTERN
from text_norm import nutrition_normalize

# -----------------------------
# 공통 유틸
# -----------------------------
def _token_has_digit(tok: str) -> bool:
    return bool(re.search(r"\d", tok))

def _cleanup_name_fragment(s: str) -> str:
    s = re.sub(PERCENT_PATTERN, " ", s, flags=re.I)
    s = re.sub(rf"\b({NUM_PATTERN})\s*({UNIT_REGEX})\b", " ", s, flags=re.I)
    s = re.sub(rf"\b{NUM_PATTERN}\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def _is_pure_unit_or_percent(s: str) -> bool:
    s = s.strip()
    if not s:
        return False
    if re.fullmatch(rf"({UNIT_REGEX})", s, flags=re.I):
        return True
    if re.fullmatch(rf"{NUM_PATTERN}%", s):
        return True
    if s in {"%", "％"}:
        return True
    return False

def match_canonical_name(fragment: str) -> Optional[str]:
    for canon, syns in NUTRIENT_SYNONYMS.items():
        for s in syns:
            if re.search(rf"\b{s}\b", fragment, re.IGNORECASE):
                return canon
    return None

def fuzzy_match_name(fragment: str) -> Optional[str]:
    frag = _cleanup_name_fragment(fragment)
    if not frag or _is_pure_unit_or_percent(frag):
        return None

    canon = match_canonical_name(frag)
    if canon:
        return canon

    all_synonyms = [syn for syns in NUTRIENT_SYNONYMS.values() for syn in syns]
    close = difflib.get_close_matches(frag, all_synonyms, n=1, cutoff=0.72)
    if close:
        return match_canonical_name(close[0])
    return None

def _split_amount_unit(tok: str) -> Tuple[Optional[str], Optional[str]]:
    m = re.match(rf'^\s*({NUM_PATTERN})\s*({UNIT_REGEX})\s*$', tok, flags=re.I)
    if m:
        return m.group(1), normalize_unit(m.group(2))
    return None, None

# ---- kcal / O→0 보정(열량 토큰용) ----
def _looks_like_kcal(s: str) -> bool:
    return bool(re.fullmatch(r"(?i)\s*kca[l1i]\s*", s))

def _fix_digits_like_zero(s: str) -> str:
    return re.sub(r"[gGoO]", "0", s)

def _find_amount_in_segment(toks: List[str], start: int, end: int) -> Optional[str]:
    i = start
    while i < end:
        t = toks[i]

        # 0g / 0mg 오인식
        m_zero_g = re.fullmatch(r"(?i)\s*o\s*(mg|g)\s*", t)
        if m_zero_g:
            return f"0 {normalize_unit(m_zero_g.group(1))}"

        # kcal이 붙어서 나온 경우 (예: 3g0kca1)
        m_kcal_one = re.fullmatch(r"(?i)\s*([0-9oOgG]+)\s*kca[l1i]\s*", t)
        if m_kcal_one:
            val = _fix_digits_like_zero(m_kcal_one.group(1))
            return f"{val} kcal"

        # 일반 NUM+UNIT
        av, au = _split_amount_unit(t)
        if av and au:
            return f"{av} {au}"

        # 분리형: NUM, UNIT  또는 NUM + kcal류
        if re.fullmatch(rf"{NUM_PATTERN}", t):
            if i + 1 < end and is_unit(toks[i + 1]):
                return f"{t} {normalize_unit(toks[i + 1])}"
            if i + 1 < end and _looks_like_kcal(toks[i + 1]):
                return f"{t} kcal"
            if i + 1 < end and _looks_like_kcal(toks[i + 1]) and re.search(r"[gGoO]", t):
                return f"{_fix_digits_like_zero(t)} kcal"
        i += 1
    return None

def _find_percent_in_segment(toks: List[str], start: int, end: int) -> Optional[str]:
    i = start
    while i < end:
        t = toks[i]
        if re.fullmatch(rf"{NUM_PATTERN}%", t):
            return t
        i += 1
    return None

# -----------------------------
# 라인 기반 파서 (Tesseract 경로용) — main.py에서 필요로 하므로 유지
# 정확도 개선 X: 최소 기능 (이름/함량/기준치 1라인 스캔)
# -----------------------------
def parse_nutrition_lines(text: str) -> List[Dict[str, Optional[str]]]:
    text = nutrition_normalize(text)
    rows: List[Dict[str, Optional[str]]] = []

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue

        # 기준치
        percent_str = None
        pm = re.search(PERCENT_PATTERN, line, flags=re.I)
        if pm:
            percent_str = f"{pm.group(1)}%"
            line = re.sub(PERCENT_PATTERN, " ", line, flags=re.I)

        # 함량 (NUM+UNIT)
        amount_str = None
        m = re.search(rf"\b({NUM_PATTERN})\s*({UNIT_REGEX})\b", line, flags=re.I)
        if m:
            val = m.group(1).replace(",", "")
            unit = normalize_unit(m.group(2))
            amount_str = f"{val} {unit}"
            line = (line[:m.start()] + " " + line[m.end():]).strip()
        # kcal 보조
        if amount_str is None:
            mk = re.search(r"(?i)\b([0-9oOgG]+)\s*kca[l1i]\b", line)
            if mk:
                amount_str = f"{_fix_digits_like_zero(mk.group(1))} kcal"

        # 이름
        name_frag = _cleanup_name_fragment(line)
        if not name_frag:
            continue
        canon = fuzzy_match_name(name_frag) or name_frag

        rows.append({"영양성분": canon, "함량": amount_str, "기준치": percent_str})

    return rows

# -----------------------------
# EasyOCR(박스) 기반 파서 — 세그먼트 + Fallback
# -----------------------------
def parse_nutrition_easyocr(pil, lang: str):
    results = run_ocr_easyocr_with_boxes(pil, lang)

    # 전체 토큰(신뢰도 무관) — 응답 텍스트/보조검색용
    tokens_all_raw: List[str] = [t.strip() for (_b, t, c) in results if t]
    tokens_all: List[str] = [nutrition_normalize(t) for t in tokens_all_raw]

    # 신뢰도 필터 통과 토큰 — 1차 탐색
    tokens_raw: List[str] = [t.strip() for (_b, t, c) in results if t and c >= 0.30]
    toks: List[str] = [nutrition_normalize(t) for t in tokens_raw]

    text_pp = " ".join(tokens_all)
    rows: List[Dict[str, Optional[str]]] = []

    i = 0
    N = len(toks)
    while i < N:
        # 이름(1~2 토큰) 매칭
        name = None
        name_len = 0
        if i < N:
            hit1 = fuzzy_match_name(toks[i])
            hit2 = fuzzy_match_name(f"{toks[i]} {toks[i+1]}") if i + 1 < N else None
            if hit2:
                name, name_len = hit2, 2
            elif hit1:
                name, name_len = hit1, 1
        if not name:
            i += 1
            continue

        # 다음 이름 경계 찾기
        j = i + name_len
        next_name_idx = N
        k = j
        while k < N:
            n2 = fuzzy_match_name(f"{toks[k]} {toks[k+1]}") if k + 1 < N else None
            n1 = fuzzy_match_name(toks[k])
            if n2 or n1:
                next_name_idx = k
                break
            k += 1

        # 구간에서 값 추출 (1차: 신뢰도 필터 통과 토큰)
        amount_str = _find_amount_in_segment(toks, j, next_name_idx)
        percent_str = _find_percent_in_segment(toks, j, next_name_idx)

        # Fallback: 동일 구간을 전체 토큰으로 재검색
        if amount_str is None or percent_str is None:
            seg_text = " ".join(tokens_all[j: next_name_idx]) if (j < len(tokens_all) and next_name_idx <= len(tokens_all)) else ""
            seg_text = seg_text.strip()
            if seg_text:
                if amount_str is None:
                    m = re.search(rf"\b({NUM_PATTERN})\s*({UNIT_REGEX})\b", seg_text, flags=re.I)
                    if m:
                        amount_str = f"{m.group(1).replace(',', '')} {normalize_unit(m.group(2))}"
                    if amount_str is None:
                        mk = re.search(r"(?i)\b([0-9oOgG]+)\s*kca[l1i]\b", seg_text)
                        if mk:
                            amount_str = f"{_fix_digits_like_zero(mk.group(1))} kcal"
                if percent_str is None:
                    p = re.search(rf"\b({NUM_PATTERN})\s*%\b", seg_text)
                    if p:
                        percent_str = f"{p.group(1)}%"

        rows.append({"영양성분": name, "함량": amount_str, "기준치": percent_str})
        i = next_name_idx

    return text_pp, rows
