require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
require('./db'); // DB 연결 트리거

const app = express();

// 내부 포트 (Express listen용)
const port = process.env.PORT || 3000;
// 외부 포트 (사용자에게 보여줄 주소용, 없으면 내부 포트로 fallback)
const externalPort = process.env.EXTERNAL_PORT || port;

app.use(express.json());

// 개발 중에는 콘솔에 로그 출력
app.use(morgan('dev'));

// Ping 테스트 라우터
const pingRouter = require('./routes/ping');
app.use('/api/ping', pingRouter);

// 서버 실행
app.listen(port, () => {
  logger.info(`✅ Server running at http://localhost:${externalPort}`);
});

