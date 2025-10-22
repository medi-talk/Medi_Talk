/* ========== 성분 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 성분 목록 조회
async function findIngredients(keyword) {
  const sql = `
    SELECT ingredient_id, ingredient_name, ingredient_english_name
    FROM ingredient
    WHERE ingredient_name LIKE ? OR ingredient_english_name LIKE ?
  `;
  const [rows] = await pool.execute(sql, [`%${keyword}%`, `%${keyword}%`]);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 성분 목록 조회
async function findUserIngredients(userId) {
  const sql = `
    SELECT i.ingredient_id, i.ingredient_name, i.ingredient_english_name
    FROM user_ingredient ui
    JOIN ingredient i ON ui.ingredient_id = i.ingredient_id
    WHERE ui.user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};


/* ---------- INSERT ---------- */

// 사용자 성분 등록
async function insertUserIngredient(userId, ingredientId) {
  const sql = `
    INSERT INTO user_ingredient (user_id, ingredient_id)
    VALUES (?, ?)
  `;
  const [r] = await pool.execute(sql, [userId, ingredientId]);

  return r.affectedRows;
};


/* ---------- UPDATE ---------- */




/* ---------- DELETE ---------- */

// 사용자 성분 삭제
async function deleteUserIngredient(userId, ingredientId) {
  const sql = `
    DELETE FROM user_ingredient
    WHERE user_id = ? AND ingredient_id = ?
  `;
  const [r] = await pool.execute(sql, [userId, ingredientId]);

  return r.affectedRows;
};



module.exports = {
  findIngredients,
  findUserIngredients,
  insertUserIngredient,
  deleteUserIngredient
};