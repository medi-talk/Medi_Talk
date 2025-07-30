const mysql = require('mysql2');
const logger = require('./utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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

