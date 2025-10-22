/* ========== 복용약 ========== */

const pool = require('../db/connection').promise();

const {
  findUserMedications,
  findFamilyMedications,
  findUserMedication,
  findUserMedicationAlarms,
  insertUserMedication,
  insertUserMedicationAlarms,
  updateUserMedication,
  deleteAllUserMedicationAlarms,
} = require('../models/medicationModel');


// "HH:MM" -> minutes (정수), 없으면 null
function timeStrToMinutes(timeStr) {
  if (!timeStr) return null;

  const m = String(timeStr).match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!m) return null;

  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);

  return hh * 60 + mm;
};

// 알람 배열 정규화 : "HH:MM" -> "HH:MM:SS", 중복 제거, 정렬
function normalizeAlarmRows(rows = []) {
  const set = new Set(
    rows
      .map(r => r.medicationAlarmTime)
      .filter(t => !!t)
      .map(t => (t.length === 5 ? `${t}:00` : t)) // "HH:MM" -> "HH:MM:SS"
  );
  return Array.from(set).sort();
};


// 사용자 복용약 목록 조회 (복용약 + 복용 알람)
async function buildUserMedicationList(userId) {
  const medication = await findUserMedications(userId);
  if (medication.length === 0) return [];

  const alarmListArr = await Promise.all(
    medication.map(m => findUserMedicationAlarms(m.userMedicationId))
  );

  const list = medication.map((m, i) => {
    const alarms = normalizeAlarmRows(alarmListArr[i]);
    const intervalMinutes = timeStrToMinutes(m.intervalTime);

    return {
      userMedicationId: m.userMedicationId,
      medicationDiscardId: m.medicationDiscardId,
      medicationType: m.medicationType,
      medicationName: m.medicationName,
      startDate: m.startDate,
      endDate: m.endDate,
      expirationDate: m.expirationDate,
      intervalTime: m.intervalTime,
      intervalMinutes: intervalMinutes,
      alarmFlag: !!m.alarmFlag,
      dawnAlarmOffFlag: !!m.dawnAlarmOffFlag,
      familyNotifyFlag: !!m.familyNotifyFlag,
      alarmTimes: alarms
    }
  });

  return list;
};

// 가족 복용약 목록 조회 (복용약 + 복용 알람)
async function buildFamilyMedicationList(familyId) {
  const medication = await findFamilyMedications(familyId);
  if (medication.length === 0) return [];

  const alarmListArr = await Promise.all(
    medication.map(m => findUserMedicationAlarms(m.userMedicationId))
  );

  const list = medication.map((m, i) => {
    const alarms = normalizeAlarmRows(alarmListArr[i]);
    const intervalMinutes = timeStrToMinutes(m.intervalTime);

    return {
      userMedicationId: m.userMedicationId,
      medicationName: m.medicationName,
      startDate: m.startDate,
      endDate: m.endDate,
      expirationDate: m.expirationDate,
      intervalTime: m.intervalTime,
      intervalMinutes: intervalMinutes,
      alarmTimes: alarms
    }
  });

  return list;
};

// 사용자 복용약 상세 조회 (복용약 + 복용 알람)
async function buildUserMedicationDetail(userMedicationId) {
  const medication = await findUserMedication(userMedicationId);
  if (!medication) return null;

  const alarmList = await findUserMedicationAlarms(userMedicationId);
  const alarms = normalizeAlarmRows(alarmList);
  const intervalMinutes = timeStrToMinutes(medication.intervalTime);

  return {
    userMedicationId: medication.userMedicationId,
    medicationDiscardId: medication.medicationDiscardId,
    medicationType: medication.medicationType,
    medicationName: medication.medicationName,
    startDate: medication.startDate,
    endDate: medication.endDate,
    expirationDate: medication.expirationDate,
    intervalTime: medication.intervalTime,
    intervalMinutes: intervalMinutes,
    alarmFlag: !!medication.alarmFlag,
    dawnAlarmOffFlag: !!medication.dawnAlarmOffFlag,
    familyNotifyFlag: !!medication.familyNotifyFlag,
    alarmTimes: alarms
  };
};

// 사용자 복용약 및 알람 추가 (트랜잭션)
async function insertMedicationWithAlarmsTX(userId, m, alarmTimes) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const { userMedicationId } = await insertUserMedication(userId, m, conn);

    const alarmsArr = Array.isArray(alarmTimes) 
    ? alarmTimes 
    : (alarmTimes === null ? [] : [alarmTimes]);

    if (alarmsArr.length > 0) {
      await insertUserMedicationAlarms(userMedicationId, alarmsArr, conn);
    }

    await conn.commit();
    return { success: true, userMedicationId };

  } catch (err) {
    await conn.rollback();
    console.error('❌ addUserMedicationWithTimes error:', err);
    return { success: false, message: '서버 내부 오류가 발생했습니다.' };

  } finally {
    conn.release();
  }
};

// 사용자 복용약 및 알람 수정 (트랜잭션)
async function updateMedicationWithAlarmsTX(userMedicationId, m, alarmTimes) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 기존 복용약 정보 수정 (복용 알람 제외)
    await updateUserMedication(userMedicationId, m, conn);

    // 기존 복용약 알람 전체 삭제
    await deleteAllUserMedicationAlarms(userMedicationId, conn);

    // 새로운 복용약 알람 추가
    const alarmsArr = Array.isArray(alarmTimes) 
      ? alarmTimes 
      : (alarmTimes === null ? [] : [alarmTimes]);

    if (alarmsArr.length > 0) {
      await insertUserMedicationAlarms(userMedicationId, alarmsArr, conn);
    }

    await conn.commit();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    console.error('❌ updateMedicationWithAlarmsTX error:', err);
    return { success: false, message: '서버 내부 오류가 발생했습니다.' };

  } finally {
    conn.release();
  }
};


module.exports = {
  buildUserMedicationList,
  buildFamilyMedicationList,
  buildUserMedicationDetail,
  insertMedicationWithAlarmsTX,
  updateMedicationWithAlarmsTX
};