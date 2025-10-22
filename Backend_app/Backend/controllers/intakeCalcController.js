/* ========== 섭취량 계산기 ========== */

const {
  findUserNutrientGroups,
  findUserNutrientGroupIntakes,
  deleteUserNutrientGroup: deleteUserNutrientGroupModel
} = require('../models/intakeCalcModel');

const {
  composeUserProfileBasic,
  buildUserNutrientStatusList,
  insertUserNutrientGroupWithIntakesTX,
  updateUserNutrientGroupWithIntakesTX
} = require('../services/intakeCalcService');


/* ---------- GET/LIST ---------- */

// 사용자 기본 프로필 조회 (만 나이, 성별, 임신/수유 여부)
const getUserProfileBasic = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await composeUserProfileBasic(userId);

    return res.json({
      success: true,
      profile
    });

  } catch (err) {
    console.error('❌ getUserProfileBasic error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 영양소별 섭취 상태 리스트 조회
const listUserNutrientStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const list = await buildUserNutrientStatusList(userId);

    return res.json({
      success: true,
      list
    });

  } catch (err) {
    console.error('❌ listUserNutrientStatus error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 영양소 그룹 조회
const listUserNutrientGroups = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groups = await findUserNutrientGroups(userId);

    return res.json({
      success: true,
      groups
    });

  } catch (err) {
    console.error('❌ listUserNutrientGroups error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 영양소 그룹 영양소별 섭취량 조회
const listUserNutrientGroupIntakes = async (req, res) => {
  try {
    const userNutrientId = req.params.userNutrientId;
    const intakes = await findUserNutrientGroupIntakes(userNutrientId);

    return res.json({
      success: true,
      groupTitle: intakes[0]?.nutrientGroupName,
      intakes
    });

  } catch (err) {
    console.error('❌ listUserNutrientGroupIntakes error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

// 사용자 영양소 그룹 + 섭취량 추가
const createUserNutrientGroupWithIntakes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { groupName, nutrients } = req.body;

    const success = await insertUserNutrientGroupWithIntakesTX(userId, groupName, nutrients);

    // 추가 성공
    if (success) {
      return res.json({ 
        success: true 
      });
    }

    // 추가 실패
    return res.status(500).json({ 
      success: false, 
      message: '섭취량 추가 중 오류가 발생했습니다.' 
    });

  } catch (err) {
    console.error('❌ createUserNutrientGroupWithIntakes error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- UPDATE ---------- */

// 사용자 영양소 그룹 + 섭취량 수정
const updateUserNutrientGroupWithIntakes = async (req, res) => {
  try {
    const userNutrientId = req.params.userNutrientId;
    const { groupName, nutrients } = req.body;

    const success = await updateUserNutrientGroupWithIntakesTX(userNutrientId, groupName, nutrients);

    // 수정 성공
    if (success) {
      return res.json({ 
        success: true 
      });
    }

    // 수정 실패
    return res.status(500).json({ 
      success: false, 
      message: '섭취량 수정 중 오류가 발생했습니다.' 
    });

  } catch (err) {
    console.error('❌ updateUserNutrientGroupWithIntakes error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- DELETE ---------- */

// 사용자 영양소 그룹 삭제
const deleteUserNutrientGroup = async (req, res) => {
  try {
    const userNutrientId = req.params.userNutrientId;

    const result = await deleteUserNutrientGroupModel(userNutrientId);

    // 삭제 성공
    if (result) {
      return res.json({ 
        success: true 
      });
    }

    // 삭제 실패
    return res.status(500).json({ 
      success: false, 
      message: '섭취량 삭제 중 오류가 발생했습니다.' 
    });

  } catch (err) {
    console.error('❌ deleteUserNutrientGroup error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


module.exports = {
  getUserProfileBasic,
  listUserNutrientStatus,
  listUserNutrientGroups,
  listUserNutrientGroupIntakes,
  createUserNutrientGroupWithIntakes,
  updateUserNutrientGroupWithIntakes,
  deleteUserNutrientGroup
};