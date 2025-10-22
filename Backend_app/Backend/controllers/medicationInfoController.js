/* ========== 의약품 정보 ========== */
/* 공공데이터포털 API 대체 로컬 DB API */

const {
  findMedications,
  findMedicationDetail
} = require('../models/medicationInfoModel');


/* ---------- GET/LIST ---------- */

// 의약품 목록 조회
const listMedications = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const medications = await findMedications(keyword);

    return res.json({
      success: true,
      medications
    });

  } catch (err) {
    console.error('❌ listMedications error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 의약품 상세 정보 조회
const getMedicationDetail = async (req, res) => {
  try {
    const medicationId = req.params.medicationId;
    const medication = await findMedicationDetail(medicationId);

    return res.json({
      success: true,
      medication
    });

  } catch (err) {
    console.error('❌ getMedicationDetail error:', err);

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
  listMedications,
  getMedicationDetail
};