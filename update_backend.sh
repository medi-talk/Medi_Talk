#!/bin/bash
set -e

echo "🚀 Medi_Talk Backend 자동 업데이트 시작..."

# 1. 최신 Backend 코드 가져오기
echo "📥 최신 코드 pull 중..."
git -C ~/projects/medi-backend-app pull --ff-only

# 2. Backend_app 안으로 덮어쓰기 (필요 파일만)
echo "🔄 코드 동기화 중..."
rsync -av --delete --exclude='.git' ~/projects/medi-backend-app/Backend/ ~/projects/Medi_Talk/Backend_app/Backend/

# 3. Docker 재빌드 및 재시작
echo "🐳 Docker 재빌드 및 재시작 중..."
cd ~/projects/Medi_Talk
docker compose up -d --build backend_app

echo "✅ 완료! 최신 Backend가 반영되었습니다."
