/* ========== 복용약 ========== */

const express = require('express');
const router = express.Router();

const { 
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
} = require('../controllers/medicationController');


/* ---------- GET ---------- */
router.get('/listUserMedications/:userId', listUserMedications);
router.get('/listFamilyMedications/:familyId', listFamilyMedications);
router.get('/getUserMedicationDetail/:userMedicationId', getUserMedicationDetail);
router.get('/getUserMedicationIntakes/:userMedicationId', getUserMedicationIntakes);

/* ---------- POST ---------- */
router.post('/createUserMedication/:userId', createUserMedication);
router.post('/createUserMedicationWithAlarms/:userId', createUserMedicationWithAlarms);
router.post('/createUserMedicationIntake/:userMedicationId', createUserMedicationIntake);

/* ---------- PUT ---------- */
router.put('/updateUserMedication/:userMedicationId', updateUserMedication);
router.put('/updateUserMedicationWithAlarms/:userMedicationId', updateUserMedicationWithAlarms);

/* ---------- DELETE ---------- */
router.delete('/deleteUserMedication/:userMedicationId', deleteUserMedication);
router.delete('/deleteUserMedicationIntake/:medicationIntakeId', deleteUserMedicationIntake);

module.exports = router;