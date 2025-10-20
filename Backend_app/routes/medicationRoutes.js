/* ========== 복용약 ========== */

const express = require('express');
const router = express.Router();

const { 
  listUserMedications,
  getUserMedicationDetail,
  createUserMedication,
  createUserMedicationWithAlarms,
  updateUserMedication,
  updateUserMedicationWithAlarms,
  deleteUserMedication
} = require('../controllers/medicationController');


/* ---------- GET ---------- */
router.get('/listUserMedications/:userId', listUserMedications);
router.get('/getUserMedicationDetail/:userMedicationId', getUserMedicationDetail);

/* ---------- POST ---------- */
router.post('/createUserMedication/:userId', createUserMedication);
router.post('/createUserMedicationWithAlarms/:userId', createUserMedicationWithAlarms);

/* ---------- PUT ---------- */
router.put('/updateUserMedication/:userMedicationId', updateUserMedication);
router.put('/updateUserMedicationWithAlarms/:userMedicationId', updateUserMedicationWithAlarms);

/* ---------- DELETE ---------- */
router.delete('/deleteUserMedication/:userMedicationId', deleteUserMedication);


module.exports = router;