import requests
import os
import urllib.parse

# ---- 설정 ----
IMAGE_PATH = os.path.join(os.path.dirname(__file__), "vitamin_kor_1.jpg")
lang = "kor+eng"
engine = "easyocr"  # 'easyocr' | 'tesseract'
OCR_URL = (
    f"http://localhost:8000/ocr/nutrition"
    f"?lang={urllib.parse.quote_plus(lang)}&engine={urllib.parse.quote_plus(engine)}"
)

def print_rows(rows):
    if not rows:
        print("⚠️ 추출된 항목이 없습니다.")
        return
    # 컬럼 폭 계산(간단 정렬)
    name_w = max(len(r.get("영양성분") or "") for r in rows)
    amt_w  = max(len(r.get("함량") or "") for r in rows + [{"함량":"함량"}])
    pct_w  = max(len(r.get("기준치") or "") for r in rows + [{"기준치":"기준치"}])

    header = f"{'영양성분'.ljust(name_w)}  {'함량'.ljust(amt_w)}  {'기준치'.ljust(pct_w)}"
    line   = "-" * len(header)
    print(header)
    print(line)
    for r in rows:
        name = (r.get("영양성분") or "").ljust(name_w)
        amt  = (r.get("함량") or "").ljust(amt_w)
        pct  = (r.get("기준치") or "").ljust(pct_w)
        print(f"{name}  {amt}  {pct}")

def run_ocr():
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ 샘플 이미지가 없습니다: {IMAGE_PATH}")
        return

    with open(IMAGE_PATH, "rb") as f:
        files = {"file": f}
        resp = requests.post(OCR_URL, files=files)

    if resp.status_code != 200:
        print("❌ 오류 발생:", resp.status_code, resp.text)
        return

    result = resp.json()
    print("✅ OCR 파싱 결과")
    print(f"- 엔진: {result.get('engine')}")
    print(f"- 언어: {result.get('lang')}\n")

    # 원문 텍스트(서버 후처리 적용본)
    raw_text = (result.get("raw_text") or "").strip()
    if raw_text:
        print("📄 Raw Text (server postprocessed):")
        for line in raw_text.splitlines():
            print(line)
        print()

    # 표 형태로 출력
    rows = result.get("rows") or []
    print("📊 Nutrition Rows (영양성분 / 함량 / 기준치):")
    print_rows(rows)

if __name__ == "__main__":
    run_ocr()

