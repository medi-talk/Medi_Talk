# healthcheck.sh (하드코드 기본 포트 제거 + compose 자동탐지)
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/.env"

HOST="localhost"
CLI_PORT=""   # --port 전용 (ENV와 충돌 방지)
URL=""
HEALTH_PATH="/health"
RETRIES=3
TIMEOUT=5
SLEEP=2
SHOW_DOCKER=false
USE_COMPOSE=true   # 실행 중이면 docker compose로 자동 탐지 시도

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--host HOST] [--port PORT] [--url URL] [--retries N] [--timeout SEC] [--docker] [--no-compose]
  --host        대상 호스트 (기본: localhost). 포트 포함 가능 (예: host:XX000)
  --port        대상 포트 (기본: .env의 EXTERNAL_PORT → 없으면 자동탐지 → 없으면 오류)
  --url         전체 URL 지정 시 host/port 무시 (예: http://example.com:XX000/health)
  --retries     재시도 횟수 (기본: 3)
  --timeout     요청 타임아웃 초 (기본: 5)
  --docker      docker 컨테이너 헬스 상태도 함께 표시
  --no-compose  docker compose 자동포트 탐지를 사용하지 않음
  -h, --help    도움말
예)
  $(basename "$0")
  $(basename "$0") --host medimedi.p-e.kr
  $(basename "$0") --host medimedi.p-e.kr:XX000
  $(basename "$0") --port XX000
  $(basename "$0") --url http://medimedi.p-e.kr:XX000/health
USAGE
}

# args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2 ;;
    --port) CLI_PORT="$2"; shift 2 ;;
    --url) URL="$2"; shift 2 ;;
    --retries) RETRIES="$2"; shift 2 ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    --docker) SHOW_DOCKER=true; shift ;;
    --no-compose) USE_COMPOSE=false; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "알 수 없는 옵션: $1"; usage; exit 2 ;;
  esac
done

# load .env (for EXTERNAL_PORT)
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

detect_compose_port() {
  # 실행 중 컨테이너에서 published 포트 자동 추출
  # 출력 예: "0.0.0.0:XX000" → XX000
  if $USE_COMPOSE && command -v docker >/dev/null 2>&1 && command -v awk >/dev/null 2>&1; then
    if docker compose ps >/dev/null 2>&1; then
      local p
      p="$(docker compose port backend 3000 2>/dev/null || true)"
      if [[ -n "$p" ]]; then
        echo "$p" | awk -F: '{print $NF}'
        return 0
      fi
    fi
  fi
  return 1
}

build_url() {
  # 1) --url가 있으면 그대로
  if [[ -n "$URL" ]]; then
    echo "$URL"; return
  fi

  # 2) --host에 이미 포트 포함 (예: host:XX000)
  if [[ "$HOST" == *:* ]]; then
    echo "http://${HOST}${HEALTH_PATH}"; return
  fi

  # 3) 포트 결정: --port(CLI_PORT) > EXTERNAL_PORT > compose 자동탐지 > (없으면 오류)
  local port=""
  if [[ -n "$CLI_PORT" ]]; then
    port="$CLI_PORT"
  elif [[ -n "${EXTERNAL_PORT:-}" ]]; then
    port="$EXTERNAL_PORT"
  else
    port="$(detect_compose_port || true)"
  fi

  if [[ -z "$port" ]]; then
    echo "에러: 포트를 알 수 없습니다. --port 또는 --url을 지정하거나 .env의 EXTERNAL_PORT를 설정하세요." >&2
    exit 2
  fi

  echo "http://${HOST}:${port}${HEALTH_PATH}"
}

TARGET_URL="$(build_url)"

# colors
ok()   { tput setaf 2 2>/dev/null || true; echo -n "$*"; tput sgr0 2>/dev/null || true; }
err()  { tput setaf 1 2>/dev/null || true; echo -n "$*"; tput sgr0 2>/dev/null || true; }

echo "▶ Health check: ${TARGET_URL}"
rc=1
for i in $(seq 1 "$RETRIES"); do
  start_ns=$(date +%s%N)
  http_code=$(curl -sS -m "$TIMEOUT" -w '%{http_code}' -o /tmp/health_body.$$ "$TARGET_URL" || true)
  end_ns=$(date +%s%N)
  ms=$(( (end_ns - start_ns)/1000000 ))
  if [[ "$http_code" == "200" ]]; then
    echo -n "  - HTTP "; ok "$http_code"; echo " (${ms}ms)"
    echo "  - response:"; sed 's/^/    /' /tmp/health_body.$$ || true
    rc=0; break
  else
    echo -n "  - HTTP "; err "${http_code:-curl-error}"; echo " (${ms}ms)  [${i}/${RETRIES}]"
    [[ "$i" -lt "$RETRIES" ]] && sleep "$SLEEP"
  fi
done
rm -f /tmp/health_body.$$ || true

if $SHOW_DOCKER; then
  echo "▶ Docker container health:"
  docker ps --format "table {{.Names}}\t{{.Status}}" | sed 's/^/  /'
fi

exit "$rc"

