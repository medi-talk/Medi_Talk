/* ========== 가족 ========== */

const express = require('express');
const router = express.Router();

const { 
  listUserFamilies,
  getUserFamilyDetail,
  getUser,
  createFamilyLink,
  updateUserFamily,
  deleteFamilyLink
} = require('../controllers/familyController');


/* ---------- GET ---------- */
router.get('/listUserFamilies/:userId', listUserFamilies);
router.get('/getUserFamilyDetail/:userId/:familyId', getUserFamilyDetail);
router.get('/getUser/:userId/:userName', getUser);

/* ---------- POST ---------- */
router.post('/createFamilyLink/:userId', createFamilyLink);

/* ---------- PUT ---------- */
router.put('/updateUserFamily/:userId/:familyId', updateUserFamily);

/* ---------- DELETE ---------- */
router.delete('/deleteFamilyLink/:userId/:familyId', deleteFamilyLink);


module.exports = router;