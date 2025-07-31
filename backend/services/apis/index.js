require('dotenv').config();
const logger = require('../../utils/logger');

const enabledApis = process.env.ENABLED_APIS?.split(',') || [];

const availableApis = {
  // 실제 사용할 API 모듈들
  naver: require('./naverAPI'),
  openai: require('./openaiAPI'),
  // 앞으로 추가될 API는 여기에 등록
};

const activeApis = {};

enabledApis.forEach(api => {
  if (availableApis[api]) {
    activeApis[api] = availableApis[api];
    logger.info(`✅ API 활성화됨: ${api}`);
  } else {
    logger.warn(`⚠️ 존재하지 않는 API 모듈: ${api}`);
  }
});

module.exports = activeApis;

