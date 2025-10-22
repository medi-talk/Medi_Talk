/* ========== 의약품 정보 ========== */
/* 공공데이터포털 API 대체 로컬 DB API */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 의약품 목록 조회
async function findMedications(keyword) {
  const sql = `
    SELECT medication_information_id, medication_name
    FROM medication_information
    WHERE medication_name LIKE ?
  `;
  const [rows] = await pool.execute(sql, [`%${keyword}%`]);
  const list = camelizeRows(rows);

  return list;
};

// 의약품 상세 정보 조회
async function findMedicationDetail(medicationInformationId) {
  const sql = `
    SELECT medication_information_id, medication_name, efficacy, use_method, warning, notandum, interaction, side_effect, storage_method
    FROM medication_information
    WHERE medication_information_id = ?
  `;
  const [rows] = await pool.execute(sql, [medicationInformationId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};


/* ---------- INSERT ---------- */



/* ---------- UPDATE ---------- */



/* ---------- DELETE ---------- */




module.exports = {
  findMedications,
  findMedicationDetail
};