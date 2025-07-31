const express = require('express');
const router = express.Router();
const { fetchDataByEngine } = require('../services/externalApi');
const logger = require('../utils/logger');

router.get('/search', async (req, res) => {
  const { query, engine = 'engine1' } = req.query;

  if (!query) {
    return res.status(400).json({ message: '검색어(query)를 입력해주세요.' });
  }

  try {
    const result = await fetchDataByEngine(query, engine);
    logger.info(`✅ ${engine} API 검색 성공: ${query}`);
    res.json(result);
  } catch (err) {
    logger.error(`❌ ${engine} API 오류: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

