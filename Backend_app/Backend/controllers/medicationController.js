/* ========== 복용약 ========== */

const {
  findUserMedicationIntakes,
  insertUserMedication,
  insertUserMedicationIntake,
  updateUserMedication: updateUserMedicationModel,
  deleteUserMedication: deleteUserMedicationModel,
  deleteUserMedicationIntake: deleteUserMedicationIntakeModel
} = require('../models/medicationModel');

const {
  buildUserMedicationList,
  buildFamilyMedicationList,
  buildUserMedicationDetail,
  insertMedicationWithAlarmsTX,
  updateMedicationWithAlarmsTX
} = require('../services/medicationService');


/* ---------- GET/LIST ---------- */

// 사용자 복용약 목록 조회 (복용약 + 복용 알람)
const listUserMedications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const medications = await buildUserMedicationList(userId);

    return res.json({
      success: true,
      medications
    });

  } catch (err) {
    console.error('❌ listUserMedications error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 가족 복용약 목록 조회 (복용약 + 복용 알람)
const listFamilyMedications = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const medications = await buildFamilyMedicationList(familyId);

    return res.json({
      success: true,
      medications
    });

  } catch (err) {
    console.error('❌ listFamilyMedications error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 복용약 상세 조회 (복용약 + 복용 알람)
const getUserMedicationDetail = async (req, res) => {
  try {
    const userMedicationId = req.params.userMedicationId;
    const medication = await buildUserMedicationDetail(userMedicationId);

    return res.json({
      success: true,
      medication
    });

  } catch (err) {
    console.error('❌ getUserMedicationDetail error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 복용약 복용 기록 조회
const getUserMedicationIntakes = async (req, res) => {
  try {
    const userMedicationId = req.params.userMedicationId;
    const intakes = await findUserMedicationIntakes(userMedicationId);

    return res.json({
      success: true,
      intakes
    });

  } catch (err) {
    console.error('❌ getUserMedicationIntakes error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

// 사용자 복용약 추가
const createUserMedication = async (req, res) => {
  try {
    const userId = req.params.userId;
    const medication = req.body.medication;

    const result = await insertUserMedication(userId, medication);

    // 추가 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 추가 실패
    return res.json({
      success: false,
      message: '복용약 추가에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createUserMedication error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 복용약 및 알람 추가
const createUserMedicationWithAlarms = async (req, res) => {
  try {
    const userId = req.params.userId;
    const medication = req.body.medication;

    let alarmTimes = req.body.alarmTimes || [];
    if (!Array.isArray(alarmTimes)) alarmTimes = [alarmTimes];

    // 중복 제거
    alarmTimes = [...new Set(alarmTimes)];

    const result = await insertMedicationWithAlarmsTX(userId, medication, alarmTimes);

    // 추가 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 추가 실패
    return res.json({
      success: false,
      message: '복용약 추가에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createUserMedication error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 복용약 복용 기록 추가
const createUserMedicationIntake = async (req, res) => {
  try {
    const userMedicationId = req.params.userMedicationId;
    const intake = req.body.intake;

    const result = await insertUserMedicationIntake(userMedicationId, intake);

    // 추가 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 추가 실패
    return res.json({
      success: false,
      message: '복용 기록 추가에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createUserMedicationIntake error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- UPDATE ---------- */

// 사용자 복용약 수정
const updateUserMedication = async (req, res) => {
  try {
    const userMedicationId = req.params.userMedicationId;
    const medication = req.body.medication;

    const result = await updateUserMedicationModel(userMedicationId, medication);

    // 수정 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 수정 실패
    return res.json({
      success: false,
      message: '복용약 수정에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ updateUserMedication error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 사용자 복용약 및 알람 수정
const updateUserMedicationWithAlarms = async (req, res) => {
  try {
    const userMedicationId = req.params.userMedicationId;
    const medication = req.body.medication;

    let alarmTimes = req.body.alarmTimes || [];
    if (!Array.isArray(alarmTimes)) alarmTimes = [alarmTimes];

    // 중복 제거
    alarmTimes = [...new Set(alarmTimes)];

    const result = await updateMedicationWithAlarmsTX(userMedicationId, medication, alarmTimes);

    // 수정 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 수정 실패
    return res.json({
      success: false,
      message: '복용약 수정에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ updateUserMedicationWithAlarms error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};


/* ---------- DELETE ---------- */

// 사용자 복용약 삭제
const deleteUserMedication = async (req, res) => {
  try {
    const userMedicationId = req.params.userMedicationId;
    
    const result = await deleteUserMedicationModel(userMedicationId);

    // 삭제 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 삭제 실패
    return res.json({
      success: false,
      message: '복용약 삭제에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteUserMedication error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 사용자 복용약 복용 기록 삭제
const deleteUserMedicationIntake = async (req, res) => {
  try {
    const medicationIntakeId = req.params.medicationIntakeId;

    const result = await deleteUserMedicationIntakeModel(medicationIntakeId);

    // 삭제 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 삭제 실패
    return res.json({
      success: false,
      message: '복용 기록 삭제에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteUserMedicationIntake error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};


module.exports = {
  listUserMedications,
  listFamilyMedications,
  getUserMedicationDetail,
  getUserMedicationIntakes,
  createUserMedication,
  createUserMedicationWithAlarms,
  createUserMedicationIntake,
  updateUserMedication,
  updateUserMedicationWithAlarms,
  deleteUserMedication,
  deleteUserMedicationIntake
};