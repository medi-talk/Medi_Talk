/* ========== 복용 타이머 ========== */

const {
  
} = require('../models/intakeTimerModel');

const {
  buildUserIntakeTimerList
} = require('../services/intakeTimerService');


/* ---------- GET/LIST ---------- */

// 사용자 복용 타이머 목록 조회
const listUserIntakeTimers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const timers = await buildUserIntakeTimerList(userId);

    return res.json({
      success: true,
      timers
    });

  } catch (err) {
    console.error('❌ listUserIntakeTimers error:', err);
    
    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

/* ---------- UPDATE ---------- */

/* ---------- DELETE ---------- */


module.exports = {
  listUserIntakeTimers
};