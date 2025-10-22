/* ========== 복용 타이머 ========== */

const express = require('express');
const router = express.Router();

const { 
  listUserIntakeTimers
} = require('../controllers/intakeTimerController');


/* ---------- GET ---------- */
router.get('/listUserIntakeTimers/:userId', listUserIntakeTimers);

/* ---------- POST ---------- */


/* ---------- PUT ---------- */


/* ---------- DELETE ---------- */



module.exports = router;