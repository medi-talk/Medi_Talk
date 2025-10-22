/* ========== 섭취량 계산기 ========== */

const pool = require('../db/connection').promise();

const {
  findUserProfileBasic,
  findUserNutrientIntakeStandards,
  findUserNutrientTotalIntake,
  insertUserNutrientGroup,
  insertUserNutrientIntakes,
  updateUserNutrientGroup,
  updateUserNutrientIntakes
} = require('../models/intakeCalcModel');


// 만 나이 계산
function calcInternationalAge(birthday) {
  // birthday: 'YYYY-MM-DD'
  const [by, bm, bd] = birthday.split('-').map(Number);

  // today
  const today = new Date();
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();

  // 총 개월 수 차이 계산
  let totalMonths = (ty - by) * 12 + (tm - bm);
  if (td < bd) totalMonths -= 1; // 생일이 지나지 않았으면 한 달 차감

  // 만 나이 계산
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return { years, months };
};

// 만 나이 + 성별, 임신/수유 여부
async function composeUserProfileBasic(userId) {
  const profile = await findUserProfileBasic(userId);

  const { years, months } = await calcInternationalAge(profile.birthday);

  const result = {
    ageYears: years,
    ageMonths: months,
    gender: profile.gender,
    pregnantFlag: profile.pregnantFlag,
    feedingFlag: profile.feedingFlag
  };

  return result;
};

// 사용자 state 결정
// 우선 순위 : 수유 > 임신 > 일반
function determineUserState(info) {
  const pregnantFlag = info.pregnantFlag;
  const feedingFlag = info.feedingFlag;
  const state = feedingFlag ? '수유' : (pregnantFlag ? '임신' : '일반');

  return state;
};

// 영양소 status 계산
// 0 : 섭취 안함 (섭취량 0)
// 1 : 적정 섭취 중 (RNI 이상 ~ UL 이하)
// 2 : 적정 섭취 중 (AI 이상)
// 3 : 충분하지 않을 수 있음 (EAR 이상 ~ RNI 미만)
// 4 : 충분 여부 불확실 (AI 미만)
// 5 : 과다 섭취 위험 (UL 초과)
// 6 : 결핍 위험 (EAR 미만)
function computeNutrientStatus(intake, standard) {
  const EAR = standard.averageNeed;
  const RNI = standard.recommendIntake;
  const AI = standard.adequateIntake;
  const UL = standard.limitIntake;

  if (intake === 0) return 0;

  if (UL > 0 && intake > UL) return 5;

  if (AI > 0) {
    return (intake >= AI) ? 2 : 4;
  }

  if (EAR > 0 && RNI > 0) {
    if (intake >= RNI) return 1;
    if (intake >= EAR && intake < RNI) return 3;
    if (intake < EAR) return 6;
  }

  return 0;
};

// status에 따른 risk 선택
function pickRiskByStatus(status, deficiencyRisk, excessRisk) {
  if (status === 5) return excessRisk || null;
  if (status === 3 || status === 4 || status === 6) return deficiencyRisk || null;
  return null;
};

// 사용자 영양소별 섭취 상태 리스트 구성
async function buildUserNutrientStatusList(userId) {
  const profile = await composeUserProfileBasic(userId);
  let age = profile.ageYears;

  // 영유아 판단 (영유아일 경우 age를 개월 수로 변경)
  if (age < 1) {
    profile.gender = '영유아';
    age = profile.ageMonths;
  }

  // state 결정
  const state = determineUserState(profile);

  const payload = {
    gender: profile.gender,
    age: age,
    state: state
  };

  // 영양소별 섭취 기준 조회
  const standards = await findUserNutrientIntakeStandards(payload);

  // 영양소별 섭취량 총합 조회
  const totalIntakes = await findUserNutrientTotalIntake(userId);

  // totalIntakes 맵핑
  const totalMap = new Map();
  for (const t of totalIntakes) {
    totalMap.set(t.nutrientId, t.totalIntake);
  }

  // status 계산 및 risk 결정 / DTO 구성
  const list = standards.map(s => {
    const nutrientId = s.nutrientId;
    const intake = totalMap.get(nutrientId) || 0;

    const status = computeNutrientStatus(intake, {
      averageNeed: s.averageNeed,
      recommendIntake: s.recommendIntake,
      adequateIntake: s.adequateIntake,
      limitIntake: s.limitIntake
    });

    const risk = pickRiskByStatus(status, s.deficiencyRisk, s.excessRisk);

    return {
      nutrientId: s.nutrientId,
      nutrientName: s.nutrientName,
      unit: s.unit,
      status: status,
      intake: intake,
      averageNeed: s.averageNeed,
      recommendIntake: s.recommendIntake,
      adequateIntake: s.adequateIntake,
      limitIntake: s.limitIntake,
      risk: risk
    };

  });

  return list;

};

// 영양소 그룹 + 섭취량 추가 (트랜잭션)
async function insertUserNutrientGroupWithIntakesTX(userId, groupName, nutrients) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { userNutrientId } = await insertUserNutrientGroup(userId, groupName, conn);

    await insertUserNutrientIntakes(userNutrientId, nutrients, conn);

    await conn.commit();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    console.error('❌ insertUserNutrientGroupWithIntakesTX error:', err);
    return { success: false, message: '섭취량 추가 중 오류가 발생했습니다.' };

  } finally {
    conn.release();
  }
};

// 영양소 그룹 + 섭취량 수정 (트랜잭션)
async function updateUserNutrientGroupWithIntakesTX(userNutrientId, groupName, nutrients) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await updateUserNutrientGroup(userNutrientId, groupName, conn);
    await updateUserNutrientIntakes(userNutrientId, nutrients, conn);

    await conn.commit();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    console.error('❌ updateUserNutrientGroupWithIntakesTX error:', err);
    return { success: false, message: '섭취량 수정 중 오류가 발생했습니다.' };

  } finally {
    conn.release();
  }
};


module.exports = {
  composeUserProfileBasic,
  buildUserNutrientStatusList,
  insertUserNutrientGroupWithIntakesTX,
  updateUserNutrientGroupWithIntakesTX
};
  