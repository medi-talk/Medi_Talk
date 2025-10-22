/* ========== 복용약 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 사용자 복용약 목록 조회
async function findUserMedications(userId) {
  const sql = `
    SELECT um.user_medication_id, um.medication_discard_id, mdi.medication_type, um.medication_name, um.start_date, um.end_date, um.expiration_date, um.interval_time, um.alarm_flag, um.dawn_alarm_off_flag, um.family_notify_flag
    FROM user_medication um
    JOIN medication_discard_info mdi ON um.medication_discard_id = mdi.medication_discard_id
    WHERE um.user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};

// 가족 복용약 목록 조회
async function findFamilyMedications(familyId) {
  const sql = `
    SELECT user_medication_id, medication_name, start_date, end_date, expiration_date, interval_time
    FROM user_medication
    WHERE user_id = ? AND family_notify_flag = TRUE
  `;
  const [rows] = await pool.execute(sql, [familyId]);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 복용약 상세 정보 조회
async function findUserMedication(userMedicationId) {
  const sql = `
    SELECT um.user_medication_id, um.medication_discard_id, mdi.medication_type, um.medication_name, um.start_date, um.end_date, um.expiration_date, um.interval_time, um.alarm_flag, um.dawn_alarm_off_flag, um.family_notify_flag
    FROM user_medication um
    JOIN medication_discard_info mdi ON um.medication_discard_id = mdi.medication_discard_id
    WHERE um.user_medication_id = ?
  `;
  const [rows] = await pool.execute(sql, [userMedicationId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};

// 사용자 복용약 알람 목록 조회
async function findUserMedicationAlarms(userMedicationId) {
  const sql = `
    SELECT medication_alarm_time
    FROM user_medication_alarm
    WHERE user_medication_id = ?
  `;
  const [rows] = await pool.execute(sql, [userMedicationId]);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 복용약 복용 기록 조회
async function findUserMedicationIntakes(userMedicationId) {
  const sql = `
    SELECT medication_intake_id, intake_date, intake_time
    FROM user_medication_intake
    WHERE user_medication_id = ?
  `;
  const [rows] = await pool.execute(sql, [userMedicationId]);
  const list = camelizeRows(rows);

  return list;
};


/* ---------- INSERT ---------- */

// 사용자 복용약 추가
async function insertUserMedication(userId, m, conn = pool) {
  const sql = `
    INSERT INTO user_medication(user_id, medication_discard_id, medication_name, start_date, end_date, expiration_date, interval_time, alarm_flag, dawn_alarm_off_flag, family_notify_flag)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userId, m.medicationDiscardId, m.medicationName, m.startDate, m.endDate, m.expirationDate,
    m.intervalTime, m.alarmFlag ? 1: 0, m.dawnAlarmOffFlag ? 1 : 0, m.familyNotifyFlag ? 1 : 0
  ];
  const [r] = await conn.execute(sql, params);
  return { userMedicationId: r.insertId, affectedRows: r.affectedRows };
};

// 사용자 복용약 알람 추가
async function insertUserMedicationAlarms(userMedicationId, alarmTimes, conn = pool) {
  const arr = Array.isArray(alarmTimes) ? alarmTimes : [alarmTimes];
  if (arr.length === 0) return { insertId: null, affectedRows: 0 };

  const sql = `
    INSERT INTO user_medication_alarm(user_medication_id, medication_alarm_time)
    VALUES ?
  `;
  const values = arr.map(time => [userMedicationId, time]);
  const [r] = await conn.query(sql, [values]);
  return { insertId: r.insertId, affectedRows: r.affectedRows };
};

// 사용자 복용약 복용 기록 추가
async function insertUserMedicationIntake(userMedicationId, i) {
  const sql = `
    INSERT INTO user_medication_intake(user_medication_id, intake_date, intake_time)
    VALUES(?, ?, ?)
  `;
  const params = [
    userMedicationId, i.intakeDate, i.intakeTime
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows;
};


/* ---------- UPDATE ---------- */

// 사용자 복용약 수정
async function updateUserMedication(userMedicationId, m) {
  const sql = `
    UPDATE user_medication
    SET medication_discard_id = ?, medication_name = ?, start_date = ?, end_date = ?, expiration_date = ?, interval_time = ?, alarm_flag = ?, dawn_alarm_off_flag = ?, family_notify_flag = ?
    WHERE user_medication_id = ?
  `;
  const params = [
    m.medicationDiscardId, m.medicationName, m.startDate, m.endDate, m.expirationDate,
    m.intervalTime, m.alarmFlag ? 1: 0, m.dawnAlarmOffFlag ? 1 : 0, m.familyNotifyFlag ? 1 : 0,
    userMedicationId
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows;
}

/* ---------- DELETE ---------- */

// 사용자 복용약 삭제
async function deleteUserMedication(userMedicationId, conn = pool) {
  const sql = `
    DELETE FROM user_medication
    WHERE user_medication_id = ?
  `;
  const [r] = await conn.execute(sql, [userMedicationId]);

  return r.affectedRows;
};

// 사용자 복용약 알람 전체 삭제 (특정 복용약의 알람 전체 삭제)
async function deleteAllUserMedicationAlarms(userMedicationId, conn = pool) {
  const sql = `
    DELETE FROM user_medication_alarm
    WHERE user_medication_id = ?
  `;
  const [r] = await conn.execute(sql, [userMedicationId]);

  return r.affectedRows;
};

// 사용자 복용약 복용 기록 삭제
async function deleteUserMedicationIntake(medicationIntakeId) {
  const sql = `
    DELETE FROM user_medication_intake
    WHERE medication_intake_id = ?
  `;
  const [r] = await pool.execute(sql, [medicationIntakeId]);

  return r.affectedRows;
};


module.exports = {
  findUserMedications,
  findFamilyMedications,
  findUserMedication,
  findUserMedicationAlarms,
  findUserMedicationIntakes,
  insertUserMedication,
  insertUserMedicationAlarms,
  insertUserMedicationIntake,
  updateUserMedication,
  deleteUserMedication,
  deleteAllUserMedicationAlarms,
  deleteUserMedicationIntake
};