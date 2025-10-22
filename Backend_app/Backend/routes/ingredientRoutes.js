/* ========== 성분 ========== */

const express = require('express');
const router = express.Router();

const { 
  listIngredients,
  listUserIngredients,
  createUserIngredient,
  deleteUserIngredient
} = require('../controllers/ingredientController');


/* ---------- GET ---------- */
router.get('/listIngredients', listIngredients);
router.get('/listUserIngredients/:userId', listUserIngredients);

/* ---------- POST ---------- */
router.post('/createUserIngredient/:userId', createUserIngredient);

/* ---------- PUT ---------- */


/* ---------- DELETE ---------- */
router.delete('/deleteUserIngredient/:userId/:ingredientId', deleteUserIngredient);



module.exports = router;