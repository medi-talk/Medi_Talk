require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// ✅ 캐시 인스턴스 (TTL 300초 = 5분)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// 사용할 외부 API들을 정의 (엔진 이름과 URL/옵션 매핑)
const engines = {
  posts: {
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: {}, // 인증 불필요
  },
  users: {
    url: 'https://jsonplaceholder.typicode.com/users',
    headers: {}, // 인증 불필요
  },
  // 예시: 인증이 필요한 엔진 추가 시
  // openai: {
  //   url: 'https://api.openai.com/v1/completions',
  //   headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  // }
};

/**
 * 지정된 엔진 이름으로 API 요청 (캐시 포함)
 * @param {string} query - 검색어나 요청 파라미터
 * @param {string} engine - 사용할 엔진 키 (기본값: 'posts')
 * @returns {Promise<Object>} - API 응답 데이터
 */
const fetchDataByEngine = async (query, engine = 'posts') => {
  const config = engines[engine];
  if (!config) throw new Error(`❌ 지원하지 않는 엔진: ${engine}`);

  const cacheKey = `${engine}:${query || 'all'}`;

  // ✅ 캐시 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info(`🗃️ [CACHE HIT] ${engine} - ${query}`);
    return cached;
  }

  try {
    const response = await axios.get(config.url, {
      params: query ? { q: query } : {},
      headers: config.headers,
    });

    const data = response.data;

    // ✅ 캐시 저장
    cache.set(cacheKey, data);
    logger.info(`📦 [CACHE SET] ${engine} - ${query}`);

    return data;
  } catch (error) {
    throw new Error(`❌ [${engine}] API 요청 실패: ${error.message}`);
  }
};

module.exports = {
  fetchDataByEngine,
};

