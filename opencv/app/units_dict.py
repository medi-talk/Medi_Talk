import re

# 중앙 규칙/사전에서 단위 원형 목록을 참조 (데이터 분리)
from rules_data import UNIT_RAW

# 정규식에서 사용
UNIT_REGEX = "|".join(re.escape(u) for u in UNIT_RAW)

# 정규 비교용 (소문자 기준)
_UNIT_SET_LOWER = {u.lower() for u in UNIT_RAW}

def normalize_unit(u: str) -> str:
    """
    단위 표기의 표준화 규칙:
      - µ/μ/㎍/mcg → ug
      - iu → IU
      - re → RE
      - ugre → ugRE
      - g, mg, ug, kcal, cal → 소문자 유지
      - 그 외는 원본 유지
    """
    if not u:
        return u
    # 마이크로 기호 통일
    u = u.replace("µ", "u").replace("μ", "u").replace("㎍", "ug")
    ul = u.lower()
    # microgram 다양한 표기 수용
    if ul in ("mcg", "ug"):
        return "ug"
    if ul == "iu":
        return "IU"
    if ul == "re":
        return "RE"
    if ul == "ugre":
        return "ugRE"
    if ul in ("mg", "g", "kcal", "cal"):
        return ul
    return u  # 알 수 없는 값은 원본 반환

def is_unit(tok: str) -> bool:
    if not tok:
        return False
    t = tok.replace("µ", "u").replace("μ", "u").replace("㎍", "ug").lower()
    # mcg도 ug로 동등 취급
    if t == "mcg":
        t = "ug"
    return t in _UNIT_SET_LOWER

__all__ = ["UNIT_REGEX", "normalize_unit", "is_unit"]
