import requests
import os
import urllib.parse

IMAGE_PATH = os.path.join(os.path.dirname(__file__), "vitamin_kor_1.jpg")
lang = "kor+eng"
OCR_URL = f"http://localhost:8000/ocr?lang={urllib.parse.quote_plus(lang)}"
# ↑ kor+eng -> kor%2Beng 로 안전하게 인코딩

def run_ocr():
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ 샘플 이미지가 없습니다: {IMAGE_PATH}")
        return

    with open(IMAGE_PATH, "rb") as f:
        files = {"file": f}
        resp = requests.post(OCR_URL, files=files)

    if resp.status_code == 200:
        print("✅ OCR 결과:")
        print(resp.json())
    else:
        print("❌ 오류 발생:", resp.status_code, resp.text)

if __name__ == "__main__":
    run_ocr()

