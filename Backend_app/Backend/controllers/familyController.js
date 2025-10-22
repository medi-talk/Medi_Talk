/* ========== 가족 ========== */

const {
  findUserFamilies,
  findUserFamilyDetail,
  findUser,
  updateUserFamily: updateUserFamilyModel,
} = require('../models/familyModel');

const {
  createMutualFamilyLink,
  removeMutualFamilyLink
} = require('../services/familyService');


/* ---------- GET/LIST ---------- */

// 가족 목록 조회
const listUserFamilies = async (req, res) => {
  try {
    const userId = req.params.userId;
    const families = await findUserFamilies(userId);

    return res.json({
      success: true,
      families
    });

  } catch (err) {
    console.error('❌ listUserFamilies error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 가족 상세 조회
const getUserFamilyDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const familyId = req.params.familyId;
    const family = await findUserFamilyDetail(userId, familyId);

    return res.json({
      success: true,
      family
    });

  } catch (err) {
    console.error('❌ getUserFamilyDetail error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 조회 (가족 추가용)
const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userName = req.params.userName;

    const user = await findUser(userId, userName);

    return res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error('❌ getUser error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

// 가족 링크 생성
const createFamilyLink = async (req, res) => {
  try {
    const userId = req.params.userId;
    const familyId = req.body.familyId;

    const result = await createMutualFamilyLink(userId, familyId);

    // 생성 성공
    if (result.success) {
      return res.json({
        success: true
      });
    }
    
    // 생성 실패
    return res.json({
      success: false,
      message: '가족 링크 생성에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createFamilyLink error:', err);
    
    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};



/* ---------- UPDATE ---------- */

// 가족 정보 수정
const updateUserFamily = async (req, res) => {
  try {
    const userId = req.params.userId;
    const familyId = req.params.familyId;
    const familyData = req.body;

    const result = await updateUserFamilyModel(userId, familyId, familyData);

    // 수정 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 수정 실패
    return res.json({
      success: false,
      message: '가족 정보 수정에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ updateUserFamily error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- DELETE ---------- */

// 가족 링크 제거
const deleteFamilyLink = async (req, res) => {
  try {
    const userId = req.params.userId;
    const familyId = req.params.familyId;

    const result = await removeMutualFamilyLink(userId, familyId);

    // 제거 성공
    if (result.success) {
      return res.json({
        success: true
      });
    }

    // 제거 실패
    return res.json({
      success: false,
      message: '가족 링크 제거에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteUserFamilyLink error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};



module.exports = {
  listUserFamilies,
  getUserFamilyDetail,
  getUser,
  createFamilyLink,
  updateUserFamily,
  deleteFamilyLink
};