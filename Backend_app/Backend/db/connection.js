require('dotenv').config(); // .env 읽기
const mysql = require('mysql2');
const logger = { info: console.log, error: console.error };

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true
});

pool.getConnection((err, connection) => {
  if (err) {
    logger.error(`❌ DB 연결 실패: ${err}`);
  } else {
    logger.info('✅ MySQL 연결 성공!');
    connection.release();
  }
});

module.exports = pool;