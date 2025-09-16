#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/.env"

# 기본값
HOST_BACKEND="localhost"
HOST_OPENCV="localhost"
HOST_DB="localhost"

PORT_BACKEND=""   # .env의 EXTERNAL_PORT 또는 compose 자동탐지
PORT_OPENCV="${OPENCV_EXTERNAL_PORT:-8000}"  # 필요시 .env에서 OPENCV_EXTERNAL_PORT로 오버라이드
PORT_DB=""        # .env의 DB_EXTERNAL_PORT

RETRIES=3
TIMEOUT=5
SLEEP=2
USE_COMPOSE=true
ONLY_SHOW_ERRORS=false
CHECK_BACKEND=true
CHECK_OPENCV=true
CHECK_DB=true

usage() {
  cat <<USAGE
Usage: $(basename "$0") [옵션]
  --only-errors        정상 항목은 출력 생략(에러만 출력)
  --no-compose         compose 자동 포트탐지 비활성화
  --backend/--no-backend  백엔드 체크 on/off (기본 on)
  --opencv/--no-opencv    OpenCV 체크 on/off (기본 on)
  --db/--no-db            DB 체크 on/off (기본 on)
  --retries N           재시도 횟수 (기본 3)
  --timeout SEC         타임아웃 초 (기본 5)
  -h, --help            도움말
설명:
  .env 의 EXTERNAL_PORT, DB_EXTERNAL_PORT, OPENCV_EXTERNAL_PORT를 사용.
  EXTERNAL_PORT이 없으면 docker compose로 backend:3000의 공개 포트 자동탐지.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --only-errors) ONLY_SHOW_ERRORS=true; shift ;;
    --no-compose) USE_COMPOSE=false; shift ;;
    --backend) CHECK_BACKEND=true; shift ;;
    --no-backend) CHECK_BACKEND=false; shift ;;
    --opencv) CHECK_OPENCV=true; shift ;;
    --no-opencv) CHECK_OPENCV=false; shift ;;
    --db) CHECK_DB=true; shift ;;
    --no-db) CHECK_DB=false; shift ;;
    --retries) RETRIES="$2"; shift 2 ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "알 수 없는 옵션: $1"; usage; exit 2 ;;
  esac
done

# .env 로드
if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
fi

# 포트 결정
PORT_BACKEND="${EXTERNAL_PORT:-}"
PORT_DB="${DB_EXTERNAL_PORT:-${DB_PORT:-}}"
[[ -n "${OPENCV_EXTERNAL_PORT:-}" ]] && PORT_OPENCV="$OPENCV_EXTERNAL_PORT"

detect_compose_backend_port() {
  if $USE_COMPOSE && command -v docker >/dev/null 2>&1; then
    docker compose ps >/dev/null 2>&1 || return 1
    local p
    p="$(docker compose port backend 3000 2>/dev/null || true)"
    [[ -n "$p" ]] || return 1
    echo "$p" | awk -F: '{print $NF}'
  fi
}

if [[ -z "$PORT_BACKEND" ]]; then
  PORT_BACKEND="$(detect_compose_backend_port || true)"
fi

# 헬퍼들
ok()  { tput setaf 2 2>/dev/null || true; echo -n "$*"; tput sgr0 2>/dev/null || true; }
err() { tput setaf 1 2>/dev/null || true; echo -n "$*"; tput sgr0 2>/dev/null || true; }

http_get_ok() {
  local url="$1"
  local http_code
  http_code=$(curl -sS -m "$TIMEOUT" -w '%{http_code}' -o /tmp/health_body.$$ "$url" || true)
  echo "$http_code"
}

tcp_check() {
  # bash 내장 /dev/tcp 로 TCP 오픈 확인
  local host="$1" port="$2"
  timeout "$TIMEOUT" bash -c "cat < /dev/null >/dev/tcp/${host}/${port}" 2>/dev/null
}

overall_rc=0

# BACKEND
if $CHECK_BACKEND; then
  if [[ -z "$PORT_BACKEND" ]]; then
    if ! $ONLY_SHOW_ERRORS; then
      echo "BACKEND: 포트 미확인(E): EXTERNAL_PORT 설정 또는 compose 자동탐지 실패"
    fi
    overall_rc=1
  else
    local_url="http://${HOST_BACKEND}:${PORT_BACKEND}/health"
    if ! $ONLY_SHOW_ERRORS; then echo "▶ BACKEND ${local_url}"; fi
    rc=1
    for i in $(seq 1 "$RETRIES"); do
      start_ns=$(date +%s%N)
      code=$(http_get_ok "$local_url")
      end_ns=$(date +%s%N); ms=$(( (end_ns - start_ns)/1000000 ))
      if [[ "$code" == "200" ]]; then
        $ONLY_SHOW_ERRORS || echo "  - HTTP $(ok 200) (${ms}ms)"
        rc=0; break
      else
        $ONLY_SHOW_ERRORS || echo "  - HTTP $(err ${code:-curl-error}) (${ms}ms) [${i}/${RETRIES}]"
        [[ "$i" -lt "$RETRIES" ]] && sleep "$SLEEP"
      fi
    done
    [[ $rc -ne 0 ]] && { echo "BACKEND: $(err FAILED)"; overall_rc=1; }
  fi
fi

# OPENCV
if $CHECK_OPENCV; then
  local_url="http://${HOST_OPENCV}:${PORT_OPENCV}/health"
  if ! $ONLY_SHOW_ERRORS; then echo "▶ OPENCV  ${local_url}"; fi
  rc=1
  for i in $(seq 1 "$RETRIES"); do
    start_ns=$(date +%s%N)
    code=$(http_get_ok "$local_url")
    end_ns=$(date +%s%N); ms=$(( (end_ns - start_ns)/1000000 ))
    if [[ "$code" == "200" ]]; then
      $ONLY_SHOW_ERRORS || echo "  - HTTP $(ok 200) (${ms}ms)"
      rc=0; break
    else
      $ONLY_SHOW_ERRORS || echo "  - HTTP $(err ${code:-curl-error}) (${ms}ms) [${i}/${RETRIES}]"
      [[ "$i" -lt "$RETRIES" ]] && sleep "$SLEEP"
    fi
  done
  [[ $rc -ne 0 ]] && { echo "OPENCV: $(err FAILED)"; overall_rc=1; }
fi

# DB
if $CHECK_DB; then
  # 호스트에서 접근은 외부 포트가 있어야 편함
  if [[ -z "$PORT_DB" ]]; then
    if ! $ONLY_SHOW_ERRORS; then
      echo "▶ DB      tcp://${HOST_DB}:<unknown>"
      echo "  - $(err FAIL)  (DB_EXTERNAL_PORT 또는 DB_PORT가 설정되어야 합니다)"
    fi
    overall_rc=1
  else
    if ! $ONLY_SHOW_ERRORS; then echo "▶ DB      tcp://${HOST_DB}:${PORT_DB}"; fi
    rc=1
    for i in $(seq 1 "$RETRIES"); do
      if tcp_check "$HOST_DB" "$PORT_DB"; then
        $ONLY_SHOW_ERRORS || echo "  - TCP $(ok OPEN)"
        rc=0; break
      else
        $ONLY_SHOW_ERRORS || echo "  - TCP $(err CLOSED) [${i}/${RETRIES}]"
        [[ "$i" -lt "$RETRIES" ]] && sleep "$SLEEP"
      fi
    done
    [[ $rc -ne 0 ]] && { echo "DB: $(err FAILED)"; overall_rc=1; }
  fi
fi

exit "$overall_rc"
