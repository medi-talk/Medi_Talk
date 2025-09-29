import cv2
import numpy as np
from text_norm import pipeline  # 중앙 정규화 유틸 사용

# =========================================================
# 이미지 전처리 (EasyOCR 친화: 데스큐 + 대비 강화 + 샤프닝)
# =========================================================
def preprocess_for_easyocr(img_rgb: np.ndarray) -> np.ndarray:
    """
    EasyOCR 인식률 향상을 위한 전처리:
      1) 기울기(스큐) 보정
      2) L 채널 CLAHE로 대비 강화
      3) 약한 샤프닝 (Unsharp-like)
    입력/출력: RGB ndarray
    """
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # 스큐 추정
    edges = cv2.Canny(gray, 50, 150)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)

    angle_deg = 0.0
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=120,
        minLineLength=max(30, int(0.15 * min(gray.shape))),
        maxLineGap=10
    )
    if lines is not None and len(lines) > 0:
        angles = []
        for x1, y1, x2, y2 in lines.reshape(-1, 4):
            dx = x2 - x1
            if dx == 0:
                continue
            ang = np.degrees(np.arctan2(y2 - y1, dx))
            if -25 <= ang <= 25:
                angles.append(ang)
        if angles:
            angle_deg = float(np.median(angles))

    if abs(angle_deg) > 0.2:
        h, w = gray.shape
        M = cv2.getRotationMatrix2D((w / 2, h / 2), angle_deg, 1.0)
        img_rgb = cv2.warpAffine(
            img_rgb, M, (w, h),
            flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )

    # 대비 강화 (LAB의 L 채널)
    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    L, A, B = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    L = clahe.apply(L)
    lab = cv2.merge([L, A, B])
    img_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

    # 약한 샤프닝
    blur = cv2.GaussianBlur(img_rgb, (0, 0), sigmaX=1.0)
    img_rgb = cv2.addWeighted(img_rgb, 1.25, blur, -0.25, 0)

    return img_rgb

# =========================================================
# 텍스트 후처리 (중앙 유틸 파이프라인 사용)
# =========================================================
def postprocess_text(text: str) -> str:
    """
    최종 텍스트 후처리 파이프라인:
      1) 일반 클린업 (불필요 기호/공백)
      2) 숫자 오인식 보정
      3) 단위 표기 보정
    ※ 영양성분 특화 보정(예: '96' → '%')은 nutrition 단계에서 처리
    """
    return pipeline(text, steps=("clean", "num", "unit"))
