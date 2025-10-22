/* ========== 사용자 ========== */

const {
  findUser,
	findUserInfo,
	findUserPassword,
	insertUser,
	updateUserInfo: updateUserInfoModel,
	updateUserPassword: updateUserPasswordModel,
  deleteUser: deleteUserModel
} = require('../models/usersModel');


/* ---------- GET/LIST ---------- */

// 로그인
const getUser = async (req, res) => {
  try {
    const { userId, userPassword } = req.body;
    const user = await findUser(userId, userPassword);

    // 로그인 성공
    if (user) {
      return res.json({
        success: true,
        user
      });
    }

    // 로그인 실패
    return res.status(401).json({
      success: false,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.'
    });

  } catch (err) {
    console.error('❌ getUser error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 정보 조회
const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userInfo = await findUserInfo(userId);

    return res.json({ 
      success: true, 
      userInfo 
    });

  } catch (err) {
    console.error('❌ getUserInfo error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

// 회원가입
const createUser = async (req, res) => {
  try {
    const result = await insertUser(req.body);

    // 회원가입 성공
    if (result) {
      return res.json({ 
        success: true 
      });
    }

    // 회원가입 실패
    return res.json({ 
      success: false, 
      message: '회원 가입에 실패했습니다.' 
    });

  } catch (err) {
    console.error('❌ createUser error:', err);

    // 회원가입 실패 (중복 아이디)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: '이미 가입된 아이디입니다.'
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- UPDATE ---------- */

// 사용자 정보 수정
const updateUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.body;

    const result = await updateUserInfoModel(userId, user);

    // 수정 성공
    if (result > 0) {
      return res.json({ 
        success: true 
      });
    }

    // 수정 실패
    return res.json({
      success: false,
      message: '사용자 정보 수정에 실패했습니다.'
    })

  } catch (err) {
    console.error('❌ updateUserInfo error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 패스워드 수정
const updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    const rows = await findUserPassword(userId);
    const userPassword = rows?.userPassword;

    // 현재 패스워드 불일치
    if (userPassword !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // 패스워드 변경
    const result = await updateUserPasswordModel(userId, newPassword);

    // 변경 성공
    if (result > 0) {
      return res.json({ 
        success: true 
      });
    }

    // 변경 실패
    return res.json({
      success: false,
      message: '비밀번호 변경에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ changeUserPassword error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};


/* ---------- DELETE ---------- */

// 사용자 탈퇴
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await deleteUserModel(userId);

    // 탈퇴 성공
    if (result > 0) {
      return res.json({ 
        success: true 
      });
    }

    // 탈퇴 실패
    return res.json({
      success: false,
      message: '사용자 탈퇴에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteUser error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });

  }
}; 



module.exports = {
  getUser,
  getUserInfo,
  createUser,
  updateUserInfo,
  updateUserPassword,
  deleteUser
};