FROM node:22

# 앱 디렉터리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci || npm install

# 소스 복사
COPY . .

# 환경 변수 (기본 포트)
ENV PORT=4000

# 컨테이너 시작
CMD ["npm", "start"]
