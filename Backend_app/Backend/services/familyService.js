/* ========== 가족 ========== */

const pool = require('../db/connection').promise();

const {
  findUserName,
  insertUserFamily,
  deleteUserFamily
} = require('../models/familyModel');


// 상호 가족 링크 생성
async function createMutualFamilyLink(userId, familyId) {
  const conn = await pool.getConnection();

  const resUser = await findUserName(userId);
  const resFamily = await findUserName(familyId);
  
  try {
    await conn.beginTransaction();

    // 사용자 -> 가족
    await insertUserFamily(userId, {
      familyId: familyId,
      nickname: resFamily.userName,
      relation: '기타',
      memo: null
    }, conn);

    // 가족 -> 사용자
    await insertUserFamily(familyId, {
      familyId: userId,
      nickname: resUser.userName,
      relation: '기타',
      memo: null
    }, conn);

    await conn.commit();
    return { success: true, message: '가족 링크가 생성되었습니다.' };

  } catch (err) {
    await conn.rollback();
    console.error('❌ createMutualFamilyLink error:', err);
    return { success: false, message: '서버 내부 오류가 발생했습니다.' };

  } finally {
    conn.release();
  }
};


// 상호 가족 링크 제거
async function removeMutualFamilyLink(userId, familyId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 사용자 -> 가족
    await deleteUserFamily(userId, familyId, conn);

    // 가족 -> 사용자
    await deleteUserFamily(familyId, userId, conn);

    await conn.commit();
    return { success: true, message: '가족 링크가 제거되었습니다.' };

  } catch (err) {
    await conn.rollback();
    console.error('❌ removeMutualFamilyLink error:', err);
    return { success: false, message: '서버 내부 오류가 발생했습니다.' };

  } finally {
    conn.release();
  }
};


module.exports = {
  createMutualFamilyLink,
  removeMutualFamilyLink
};