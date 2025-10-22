/* ========== 의약품 폐기 정보 ========== */

const express = require('express');
const router = express.Router();

const {
  listMedicationDiscardTypes,
  listDiscardMedications,
  getMedicationDiscardInfo
} = require('../controllers/discardInfoController');


/* ---------- GET ---------- */
router.get('/listMedicationDiscardTypes', listMedicationDiscardTypes);
router.get('/listDiscardMedications/:userId', listDiscardMedications);
router.get('/getMedicationDiscardInfo/:medicationDiscardId', getMedicationDiscardInfo);

/* ---------- POST ---------- */

/* ---------- PUT ---------- */

/* ---------- DELETE ---------- */


module.exports = router;