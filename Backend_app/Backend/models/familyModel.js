/* ========== 가족 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 가족 목록 조회
async function findUserFamilies(userId) {
  const sql = `
    SELECT family_id, nickname, relation, memo
    FROM family
    WHERE user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};

// 가족 상세 정보 조회
async function findUserFamilyDetail(userId, familyId) {
  const sql = `
    SELECT family_id, nickname, relation, memo
    FROM family
    WHERE user_id = ? AND family_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId, familyId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};

// 사용자 조회 (가족 추가용)
async function findUser(userId, userName) {
  const sql = `
    SELECT user_id
    FROM users
    WHERE user_id = ? AND user_name = ?
  `;
  const [rows] = await pool.execute(sql, [userId, userName]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};

// 사용자 이름 조회 (가족 추가용)
async function findUserName(userId) {
  const sql = `
    SELECT user_name
    FROM users
    WHERE user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};


/* ---------- INSERT ---------- */

// 가족 추가
async function insertUserFamily(userId, f, conn = pool) {
  const sql = `
    INSERT INTO family (user_id, family_id, nickname, relation, memo)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    userId, 
    f.familyId,
    f.nickname,
    f.relation,
    f.memo ?? null
  ];
  const [r] = await conn.execute(sql, params);

  return r.affectedRows;
};


/* ---------- UPDATE ---------- */

// 가족 정보 수정
async function updateUserFamily(userId, familyId, f) {
  const sql = `
    UPDATE family
    SET nickname = ?, relation = ?, memo = ?
    WHERE user_id = ? AND family_id = ?
  `;
  const params = [
    f.nickname,
    f.relation,
    f.memo,
    userId,
    familyId
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows;
};


/* ---------- DELETE ---------- */

// 가족 삭제
async function deleteUserFamily(userId, familyId, conn = pool) {
  const sql = `
    DELETE FROM family
    WHERE user_id = ? AND family_id = ?
  `;
  const [r] = await conn.execute(sql, [userId, familyId]);

  return r.affectedRows;
};


module.exports = {
  findUserFamilies,
  findUserFamilyDetail,
  findUser,
  findUserName,
  insertUserFamily,
  updateUserFamily,
  deleteUserFamily
};