const axios = require('axios');

// 사용할 외부 API들을 정의 (엔진 이름과 URL 매핑)
const engines = {
  posts: 'https://jsonplaceholder.typicode.com/posts',
  users: 'https://jsonplaceholder.typicode.com/users',
  // 여기에 추후 추가 가능: openai, naver 등
};

/**
 * 지정된 엔진 이름으로 API 요청
 * @param {string} query - 검색어나 요청 쿼리
 * @param {string} engine - 사용할 엔진 키 (기본값: 'posts')
 * @returns {Promise<Object>} - API 응답 결과
 */
const fetchDataByEngine = async (query, engine = 'posts') => {
  const url = engines[engine];

  if (!url) {
    throw new Error(`❌ 지원하지 않는 엔진: ${engine}`);
  }

  try {
    const response = await axios.get(url, query ? { params: { q: query } } : {});
    return response.data;
  } catch (error) {
    throw new Error(`❌ [${engine}] API 요청 실패: ${error.message}`);
  }
};

module.exports = {
  fetchDataByEngine,
};

