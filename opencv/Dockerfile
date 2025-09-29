FROM python:3.11-slim

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender1 curl ca-certificates \
    tesseract-ocr tesseract-ocr-kor tesseract-ocr-eng \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# 먼저 파이썬 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip

# (A) PyTorch CUDA 12.8 빌드 설치 (GPU 사용)
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cu128 \
    torch==2.8.0 torchvision==0.23.0

# (B) 나머지 requirements + easyocr
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir easyocr==1.7.2
COPY app/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
