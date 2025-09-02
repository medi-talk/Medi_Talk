const express = require('express');
const router = express.Router();
const pool = require('../db');
const logger = require('../utils/logger');

router.get('/', (req, res) => {
  const startedAt = Date.now();

  pool.query('SELECT 1', (err) => {
    const ok = !err;
    if (err) {
      logger.error(`❌ /health DB ping 실패: ${err.message}`);
    }

    res.status(ok ? 200 : 500).json({
      status: ok ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      db: ok ? 'connected' : 'disconnected',
    });
  });
});

module.exports = router;
