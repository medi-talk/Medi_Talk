/* ========== 복용 타이머 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 사용자 복용 타이머 목록 조회
async function findUserIntakeTimers(userId) {
  const sql = `
    SELECT user_medication_id, medication_name, interval_time, alarm_flag, dawn_alarm_off_flag
    FROM user_medication
    WHERE user_id = ? AND interval_time IS NOT NULL
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
}

/* ---------- INSERT ---------- */

/* ---------- UPDATE ---------- */

/* ---------- DELETE ---------- */



module.exports = {
  findUserIntakeTimers
};