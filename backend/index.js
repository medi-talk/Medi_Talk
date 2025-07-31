// 환경 설정
require('dotenv').config();

// 모듈 임포트
const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
require('./db'); // ✅ DB 연결 (즉시 실행)

// 앱 초기화
const app = express();

// 포트 설정
const port = process.env.PORT || 3000; // 내부 포트 (Express listen용)
const externalPort = process.env.EXTERNAL_PORT || port; // 외부에 안내할 포트

// 미들웨어 설정
app.use(express.json());      // JSON 파싱
app.use(morgan('dev'));       // 요청 로그 (개발용)

// 라우터 설정
app.use('/api/ping', require('./routes/ping')); // Ping 테스트
app.use('/api', require('./routes/api'));       // 기타 API

// 서버 시작
app.listen(port, () => {
  logger.info(`✅ Server running at http://localhost:${externalPort}`);
});

