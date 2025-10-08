import re
from typing import Iterable
from units_dict import normalize_units_in_text  # 단위 보정은 units 모듈에서 일원화

# 숫자 토큰 내 오인식 보정 맵
_TRANS_NUM = str.maketrans({
    "O": "0", "o": "0", "D": "0",
    "i": "1", "l": "1", "I": "1",
    "Z": "7", "S": "5", "B": "8",
})

def token_has_digit(tok: str) -> bool:
    return bool(re.search(r"\d", tok))

def clean_text_generic(text: str) -> str:
    """
    OCR 텍스트에서 시각적 구분자 제거 및 공백 정리(안전 영역).
    """
    out_lines = []
    for line in text.splitlines():
        line = re.sub(r"[|;+:{}!]", " ", line)
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            out_lines.append(line)
    return "\n".join(out_lines)

def normalize_numbers(text: str) -> str:
    """
    숫자를 포함한 토큰에 한해 O/D→0, i/l/I→1, Z→7, S→5, B→8 치환.
    """
    fixed_lines = []
    for line in text.splitlines():
        toks = line.split()
        fixed_lines.append(" ".join(t.translate(_TRANS_NUM) if token_has_digit(t) else t for t in toks))
    return "\n".join(fixed_lines)

def pipeline(text: str, steps: Iterable[str] = ("clean", "num", "unit")) -> str:
    """
    조합형 파이프라인. 필요 단계만 선택 가능.
      steps: "clean" | "num" | "unit"
    """
    for s in steps:
        if s == "clean":
            text = clean_text_generic(text)
        elif s == "num":
            text = normalize_numbers(text)
        elif s == "unit":
            text = normalize_units_in_text(text)  # ← 단위 보정 위임
    return text

# ============================
# Nutrition-specific normalize
# ============================
from constants import NUM_PATTERN

def nutrition_normalize(text: str) -> str:
    """
    영양성분 파싱에 특화된 추가 정규화:
      - 전각 퍼센트(％) → %  (units 모듈에서 이미 처리하지만 안전겸)
      - '(수치) 96' → '(수치)%' (예: '26 96' → '26%')
      - 숫자를 포함한 토큰에 한해 O/D→0, i/l/I→1, Z→7, S→5, B→8 치환
    ※ 일반 파이프라인(pipeline)과 조합해 쓰는 것을 권장
    """
    # 일반 파이프라인으로 안전 클린업/숫자/단위 보정
    text = pipeline(text, steps=("clean", "num", "unit"))
    # 전각 % 안전 보정 (중복 호출되어도 무해)
    text = text.replace("％", "%")
    # '96' → '%' (숫자 토큰 뒤에서만)
    text = re.sub(rf"({NUM_PATTERN})\s*96\b", r"\1%", text)
    return text
