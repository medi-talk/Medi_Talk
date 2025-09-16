// 환경 설정
require('dotenv').config();

// 모듈 임포트
const express = require('express');
const logger = require('./utils/logger');
const pool = require('./db'); // DB 연결(즉시 실행) + 커넥션 풀 사용

const http = require('http');
const OPENCV_BASE_URL = process.env.OPENCV_BASE_URL || 'http://opencv:8000';

// 앱 초기화
const app = express();

// 포트 설정
const port = process.env.PORT || 3000; // 내부 포트 (Express listen용)
const externalPort = process.env.EXTERNAL_PORT || port; // 외부에 안내할 포트

// 미들웨어 설정
app.use(express.json());      // JSON 파싱

// HTTP 요청 로깅
app.use((req, res, next) => {
  //logger.info(`[HTTP] ${req.method} ${req.originalUrl}`);
  // /health 는 로깅 스킵 (헬스체크 주기적 호출 때문에 로그 과다 방지)
  if (req.originalUrl === '/health' || req.originalUrl.startsWith('/health?')) {
    return next();
  }
  logger.info(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// 라우터 설정
app.use('/api/ping', require('./routes/ping')); // Ping 테스트
app.use('/api', require('./routes/api'));       // 기타 API
app.use('/health', require('./routes/health')); // health api

// 서버 시작
app.listen(port, () => {
  logger.info(`✅ Server running at http://localhost:${externalPort}`);
  const healthMonitor = require('./utils/healthMonitor');
  healthMonitor.start();
});

// ---------------------------
// 부팅 후 준비 상태 점검(로그 전용)
// ---------------------------
function httpGetOk(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      // 2xx 면 OK
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        // 응답 바디는 버림
        res.resume();
        resolve(true);
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

async function waitForDbReady(maxRetries = 20, intervalMs = 1500) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        pool.query('SELECT 1', (err) => (err ? reject(err) : resolve()));
      });
      return true;
    } catch (e) {
      if (i === maxRetries) throw e;
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
}

async function waitForOpencvReady(maxRetries = 20, intervalMs = 1500) {
  const url = `${OPENCV_BASE_URL}/health`;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await httpGetOk(url);
      return true;
    } catch (e) {
      if (i === maxRetries) throw e;
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
}

(async () => {
  try {
    await waitForDbReady();
    logger.info('🎯 DB ready');
    await waitForOpencvReady();
    logger.info(`🎯 OpenCV ready (${OPENCV_BASE_URL})`);
    logger.info('🚀 All systems ready');
  } catch (e) {
    logger.error(`❌ Startup readiness check failed: ${e.message}`);
  }
})();
