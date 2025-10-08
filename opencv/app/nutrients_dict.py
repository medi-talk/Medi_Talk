# app/nutrients_dict.py
# 비타민 계열 12종만 포함 (하위 구분 없음, 단일 매칭 전용)

NUTRIENT_SYNONYMS = {
    "비타민 A": [
        "비타민 A", "비타민A", "Vitamin A", "A", "레티놀", "Retinol"
    ],
    "비타민 D": [
        "비타민 D", "비타민D", "Vitamin D", "D"
    ],
    "비타민 E": [
        "비타민 E", "비타민E", "Vitamin E", "E"
    ],
    "비타민 K": [
        "비타민 K", "비타민K", "Vitamin K", "K"
    ],
    "비타민 C": [
        "비타민 C", "비타민C", "Vitamin C", "C", "아스코르빈산"
    ],
    "비타민 B6": [
        "비타민 B6", "비타민B6", "Vitamin B6", "B6"
    ],
    "비타민 B12": [
        "비타민 B12", "비타민B12", "Vitamin B12", "B12"
    ],
    "티아민": [
        "티아민", "Thiamin", "비타민 B1", "비타민B1", "B1"
    ],
    "리보플라빈": [
        "리보플라빈", "Riboflavin", "비타민 B2", "비타민B2", "B2"
    ],
    "엽산": [
        "엽산", "Folate", "Folic acid", "DFE"
    ],
    "비오틴": [
        "비오틴", "Biotin", "비타민 H", "Vitamin H"
    ],
    "판토텐산": [
        "판토텐산", "Pantothenic acid", "비타민 B5", "비타민B5", "B5"
    ],
}

__all__ = ["NUTRIENT_SYNONYMS"]
