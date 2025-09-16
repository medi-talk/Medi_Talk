# 1) 베이스 이미지는 최상단에 와야 함
FROM node:18

# 2) 타임존(KST) 설정
ENV TZ=Asia/Seoul
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata \
 && rm -rf /var/lib/apt/lists/*

# 3) 작업 디렉토리
WORKDIR /app

# 4) 의존성 설치 (lock 파일 있으면 npm ci 권장)
COPY package*.json ./
RUN npm ci || npm install

# 5) 앱 소스 복사
COPY . .

# 6) (필요시) 기본 포트 지정 가능
# ENV PORT=3000

# 7. 실행 명령
CMD ["node", "index.js"]
