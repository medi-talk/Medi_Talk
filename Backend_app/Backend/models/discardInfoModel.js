/* ========== 의약품 폐기 정보 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 의약품 폐기 유형 조회
async function findMedicationDiscardTypes() {
  const sql = `
    SELECT medication_discard_id, medication_type
    FROM medication_discard_info
  `;
  const [rows] = await pool.execute(sql);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 폐기 의약품 목록 조회
async function findDiscardMedications(userId) {
  const sql = `
    SELECT user_medication_id, medication_discard_id, medication_name, end_date, expiration_date
    FROM user_medication
    WHERE user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};

// 의약품 폐기 정보 조회
async function findMedicationDiscardInfo(medicationDiscardId) {
  const sql = `
    SELECT medication_type, discard_method
    FROM medication_discard_info
    WHERE medication_discard_id = ?
  `;
  const [rows] = await pool.execute(sql, [medicationDiscardId]);
  const row = rows[0] ?? null;
  
  if (!row) return null;
  
  const record = camelizeRow(row);

  return record;
};


/* ---------- INSERT ---------- */

/* ---------- UPDATE ---------- */

/* ---------- DELETE ---------- */



module.exports = {
  findMedicationDiscardTypes,
  findDiscardMedications,
  findMedicationDiscardInfo
};