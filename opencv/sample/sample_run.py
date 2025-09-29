import requests
import os
import urllib.parse
import sys

# ---- 설정 ----
IMAGE_PATH = os.path.join(os.path.dirname(__file__), "vitamin_kor_1.jpg")
lang = os.environ.get("OCR_LANG", "kor+eng")
engine = os.environ.get("OCR_ENGINE", "easyocr")  # 'easyocr' | 'tesseract'
endpoint = os.environ.get("OCR_ENDPOINT", "/ocr/nutrition")  # '/ocr' | '/ocr/nutrition'
base_url = os.environ.get("OCR_BASE_URL", "http://localhost:8000")
OCR_URL = f"{base_url}{endpoint}?lang={urllib.parse.quote_plus(lang)}&engine={urllib.parse.quote_plus(engine)}"

def main():
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ 샘플 이미지가 없습니다: {IMAGE_PATH}")
        sys.exit(1)

    with open(IMAGE_PATH, "rb") as f:
        files = {"file": f}
        # 서버가 주는 대로 받는다 (Accept는 기본값으로 둠)
        resp = requests.post(OCR_URL, files=files)

    # 상태/헤더 표시
    print("HTTP", resp.status_code)
    for k, v in resp.headers.items():
        print(f"{k}: {v}")
    print()

    # 바디 원문 그대로 출력
    # (JSON이든 XML이든 가공하지 않음)
    try:
        # 보기 좋게: 가능하면 JSON pretty, 실패하면 원문 텍스트
        data = resp.json()
        import json
        print(json.dumps(data, ensure_ascii=False, indent=2))
    except Exception:
        # JSON이 아니면 그대로 출력
        print(resp.text)

if __name__ == "__main__":
    main()
