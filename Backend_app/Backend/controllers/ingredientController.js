/* ========== 성분 ========== */

const {
  findIngredients,
  findUserIngredients,
  insertUserIngredient,
  deleteUserIngredient: deleteUserIngredientModel
} = require('../models/ingredientModel');


/* ---------- GET/LIST ---------- */

// 성분 목록 조회
const listIngredients = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const ingredients = await findIngredients(keyword);

    return res.json({
      success: true,
      ingredients
    });

  } catch (err) {
    console.error('❌ listIngredients error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 성분 목록 조회
const listUserIngredients = async (req, res) => {
  try {
    const userId = req.params.userId;
    const ingredients = await findUserIngredients(userId);

    return res.json({
      success: true,
      ingredients
    });

  } catch (err) {
    console.error('❌ listUserIngredients error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

// 사용자 성분 등록
const createUserIngredient = async (req, res) => {
  try {
    const userId= req.params.userId;
    const ingredientId = req.body.ingredientId;

    const result = await insertUserIngredient(userId, ingredientId);

    // 등록 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 등록 실패
    return res.json({
      success: false,
      message: '성분 등록에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createUserIngredient error:', err);

    // 등록 실패 (중복 성분)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: '이미 등록된 성분입니다.'
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- UPDATE ---------- */



/* ---------- DELETE ---------- */

// 사용자 성분 삭제
const deleteUserIngredient = async (req, res) => {
  try {
    const userId= req.params.userId;
    const ingredientId = req.params.ingredientId;

    const result = await deleteUserIngredientModel(userId, ingredientId);

    // 삭제 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 삭제 실패
    return res.json({
      success: false,
      message: '성분 삭제에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteUserIngredient error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


module.exports = {
  listIngredients,
  listUserIngredients,
  createUserIngredient,
  deleteUserIngredient
};