from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import cv2
import pytesseract
import io
import os

app = FastAPI(title="OpenCV API (edge detection demo)")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze/edges")
async def analyze_edges(file: UploadFile = File(...), low: int = 100, high: int = 200):
    try:
        data = await file.read()
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image")
        edges = cv2.Canny(img, low, high)
        nonzero = int(np.count_nonzero(edges))
        total = int(edges.size)
        return JSONResponse({
            "width": int(edges.shape[1]),
            "height": int(edges.shape[0]),
            "edge_pixels": nonzero,
            "edge_ratio": round(nonzero / total, 6)
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...), lang: str = "eng"):
    try:
        # Tesseract 데이터 경로(컨테이너에 영구설정했다면 이 줄은 없어도 됨)
        os.environ.setdefault("TESSDATA_PREFIX", "/usr/share/tesseract-ocr/5/tessdata")

        data = await file.read()
        img = Image.open(io.BytesIO(data)).convert("RGB")  # Pillow로 로드
        # OCR 실행
        text = pytesseract.image_to_string(img, lang=lang)
        return JSONResponse({"lang": lang, "text": text})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

