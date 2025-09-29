"""
OCR 및 영양성분 파싱에 공통으로 쓰이는 상수/정규식 모음
"""

# 숫자 패턴 (정수, 소수 포함)
NUM_PATTERN = r"\d+(?:[.,]\d+)?"

# 단위 패턴은 units_dict.py에서 관리
# UNIT_PATTERNS = ["g", "mg", "µg", "ug", "μg", "kcal", "cal", "IU"]

# 퍼센트 패턴 (예: 30%, 30％, 3096)
PERCENT_PATTERN = rf"({NUM_PATTERN})\s*(%|％|96)\b"
