FROM node:22

# /app 기준으로 작업
WORKDIR /app

# Backend의 의존성만 설치 (중첩 방지 패턴)
COPY Backend/package*.json Backend/
RUN cd Backend && (npm ci || npm install)

# Backend 소스 전체 복사 (디렉터리 자체를 /app/Backend 로)
COPY Backend Backend

# 앱 포트
ENV PORT=4000

# 서버 실행 (중첩 없이 정확한 경로)
CMD ["node", "Backend/app.js"]
