/* ========== 의약품 정보 ========== */
/* 공공데이터포털 API 대체 로컬 DB API */

const express = require('express');
const router = express.Router();

const { 
  listMedications,
  getMedicationDetail
} = require('../controllers/medicationInfoController');


/* ---------- GET ---------- */
router.get('/listMedications', listMedications);
router.get('/getMedicationDetail/:medicationId', getMedicationDetail);

/* ---------- POST ---------- */


/* ---------- PUT ---------- */


/* ---------- DELETE ---------- */




module.exports = router;