/* ========== 사용자 ========== */

const express = require('express');
const router = express.Router();

const { 
  getUser,
  getUserInfo,
  createUser,
  updateUserInfo,
  updateUserPassword,
  deleteUser
} = require('../controllers/usersController');


/* ---------- GET ---------- */
router.get('/getUserInfo/:userId', getUserInfo);

/* ---------- POST ---------- */
router.post('/createUser', createUser);
router.post('/getUser', getUser);

/* ---------- PUT ---------- */
router.put('/updateUserInfo/:userId', updateUserInfo);
router.put('/updateUserPassword/:userId', updateUserPassword);


/* ---------- DELETE ---------- */
router.delete('/deleteUser/:userId', deleteUser);


module.exports = router;