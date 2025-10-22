/* ========== 의약품 폐기 정보 ========== */

const {
  findMedicationDiscardTypes,
  findDiscardMedications,
  findMedicationDiscardInfo
} = require('../models/discardInfoModel');


/* ---------- GET/LIST ---------- */

// 의약품 폐기 유형 조회
const listMedicationDiscardTypes = async (req, res) => {
  try {
    const types = await findMedicationDiscardTypes();

    return res.json({
      success: true,
      types
    });

  } catch (err) {
    console.error('❌ listMedicationDiscardTypes error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 폐기 의약품 목록 조회
const listDiscardMedications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const medications = await findDiscardMedications(userId);

    return res.json({
      success: true,
      medications
    });

  } catch (err) {
    console.error('❌ listDiscardMedications error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 의약품 폐기 정보 조회
const getMedicationDiscardInfo = async (req, res) => {
  try {
    const medicationDiscardId = req.params.medicationDiscardId;
    const info = await findMedicationDiscardInfo(medicationDiscardId);

    return res.json({
      success: true,
      info
    });

  } catch (err) {
    console.error('❌ getMedicationDiscardInfo error:', err);

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
  listMedicationDiscardTypes,
  listDiscardMedications,
  getMedicationDiscardInfo
};