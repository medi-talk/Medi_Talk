# 1. 베이스 이미지 설정 (Node 18 LTS 권장)
FROM node:18

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 의존성 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 앱 소스 코드 복사
COPY . .

# 5. 환경 변수 (선택: Docker 환경에서 직접 지정 가능)
# ENV PORT=3000

# 6. 컨테이너가 열 포트
EXPOSE 3000

# 7. 실행 명령
CMD [ "node", "index.js" ]

