/* ========== 복용 타이머 ========== */

const pool = require('../db/connection').promise();

const {
  findUserIntakeTimers
} = require('../models/intakeTimerModel');


// "HH:MM" -> minutes (정수), 없으면 null
function timeStrToMinutes(timeStr) {
  if (!timeStr) return null;

  const m = String(timeStr).match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!m) return null;

  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);

  return hh * 60 + mm;
};


// 사용자 복용 타이머 목록 조회 (복용 분 추가)
async function buildUserIntakeTimerList(userId) {
  const timers = await findUserIntakeTimers(userId);
  if (!timers) return [];

  const list = timers.map(t => {
    const intervalMinutes = timeStrToMinutes(t.intervalTime);

    return {
      userMedicationId: t.userMedicationId,
      medicationName: t.medicationName,
      intervalTime: t.intervalTime,
      intervalMinutes,
      alarmFlag: !!t.alarmFlag,
      dawnAlarmOffFlag: !!t.dawnAlarmOffFlag
    };
  });

  return list;
};


module.exports = {
  buildUserIntakeTimerList  
};