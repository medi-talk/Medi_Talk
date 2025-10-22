/* ========== 섭취량 계산기 ========== */

const express = require('express');
const router = express.Router();

const {
   getUserProfileBasic,
   listUserNutrientStatus,
   listUserNutrientGroups,
   listUserNutrientGroupIntakes,
   createUserNutrientGroupWithIntakes,
   updateUserNutrientGroupWithIntakes,
   deleteUserNutrientGroup
} = require('../controllers/intakeCalcController');


/* ---------- GET ---------- */
router.get('/getUserProfileBasic/:userId', getUserProfileBasic);
router.get('/listUserNutrientStatus/:userId', listUserNutrientStatus);
router.get('/listUserNutrientGroups/:userId', listUserNutrientGroups);
router.get('/listUserNutrientGroupIntakes/:userNutrientId', listUserNutrientGroupIntakes);

/* ---------- POST ---------- */
router.post('/createUserNutrientGroupWithIntakes/:userId', createUserNutrientGroupWithIntakes);

/* ---------- PUT ---------- */
router.put('/updateUserNutrientGroupWithIntakes/:userNutrientId', updateUserNutrientGroupWithIntakes);

/* ---------- DELETE ---------- */
router.delete('/deleteUserNutrientGroup/:userNutrientId', deleteUserNutrientGroup);



module.exports = router;