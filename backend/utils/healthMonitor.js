const http = require('http');
const logger = require('./logger');
const pool = require('../db');

const OPENCV_BASE_URL = process.env.OPENCV_BASE_URL || 'http://opencv:8000';
const BACKEND_HEALTH_URL = process.env.BACKEND_HEALTH_URL || `http://localhost:${process.env.PORT || 3000}/health`;
const INTERVAL_SEC = parseInt(process.env.HEALTH_INTERVAL_SEC || '300', 10); // 5분

function httpGet(url, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      (res.statusCode && res.statusCode >= 200 && res.statusCode < 300)
        ? resolve()
        : reject(new Error(`HTTP ${res.statusCode}`));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

async function checkDb() {
  await new Promise((resolve, reject) => {
    pool.query('SELECT 1', (err) => (err ? reject(err) : resolve()));
  });
}

async function checkOpencv() {
  await httpGet(`${OPENCV_BASE_URL}/health`);
}

async function checkBackend() {
  await httpGet(BACKEND_HEALTH_URL);
}

async function runOnce() {
  const results = await Promise.allSettled([
    (async () => { await checkDb();     return '[DB] OK'; })(),
    (async () => { await checkOpencv(); return '[OpenCV] OK'; })(),
    (async () => { await checkBackend();return '[Backend] OK'; })(),
  ]);

  const errors = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason && r.reason.message ? r.reason.message : String(r.reason));

  if (errors.length > 0) {
    logger.error(`❌ Health check failed: ${errors.join(' | ')}`);
  }
}

function start() {
  const initialDelayMs = parseInt(process.env.HEALTH_INITIAL_DELAY_MS || '15000', 10);
  setTimeout(() => {
    runOnce().catch(() => {});
    setInterval(() => {
      runOnce().catch(() => {});
    }, INTERVAL_SEC * 1000);
  }, initialDelayMs);
}

module.exports = { start };
