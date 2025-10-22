/* ========== 섭취량 계산기 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 사용자 기본 정보 조회
async function findUserProfileBasic(userId) {
  const sql = `
    SELECT birthday, gender, pregnant_flag, feeding_flag
    FROM users
    WHERE user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const row = rows[0] ?? null;


  if (!row) return null;

  const record = camelizeRow(row);

  record.pregnantFlag = !!record.pregnantFlag;
  record.feedingFlag = !!record.feedingFlag;

  return record;
};

// 사용자 영양소별 섭취 기준 조회
async function findUserNutrientIntakeStandards(info) {
  const sql = `
    SELECT n.nutrient_id, n.nutrient_name, n.unit, n.deficiency_risk, n.excess_risk, nis.average_need, nis.recommend_intake, nis.adequate_intake, nis.limit_intake
    FROM nutrient_intake_standard nis
    JOIN nutrient n ON nis.nutrient_id = n.nutrient_id
    WHERE nis.gender = ?
      AND ? BETWEEN nis.min_age AND nis.max_age
      AND nis.state = ?
  `;
  const params = [
    info.gender,
    info.age,
    info.state
  ];
  const [rows] = await pool.execute(sql, params);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 영양소별 섭취량 총합 조회
async function findUserNutrientTotalIntake(userId) {
  const sql = `
    SELECT nutrient_id, SUM(intake) AS total_intake
    FROM user_nutrient_intake AS uni
    JOIN user_nutrient AS un ON uni.user_nutrient_id = un.user_nutrient_id
    WHERE un.user_id = ?
    GROUP BY nutrient_id
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 영양소 그룹 조회
async function findUserNutrientGroups(userId) {
  const sql = `
    SELECT user_nutrient_id, nutrient_group_name
    FROM user_nutrient
    WHERE user_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};

// 사용자 영양소 그룹 영양소별 섭취량 조회
async function findUserNutrientGroupIntakes(userNutrientId) {
  const sql = `
    SELECT n.nutrient_id, n.nutrient_name, n.unit, ROUND(uni.intake, 1) AS intake, un.nutrient_group_name
    FROM user_nutrient_intake AS uni
    JOIN nutrient AS n ON uni.nutrient_id = n.nutrient_id
    JOIN user_nutrient AS un ON uni.user_nutrient_id = un.user_nutrient_id
    WHERE uni.user_nutrient_id = ?
  `;
  const [rows] = await pool.execute(sql, [userNutrientId]);
  const list = camelizeRows(rows);

  return list;
};


/* ---------- INSERT ---------- */

// 사용자 영양소 그룹 추가
async function insertUserNutrientGroup(userId, groupName, conn = pool) {
  const sql = `
    INSERT INTO user_nutrient (user_id, nutrient_group_name)
    VALUES (?, ?)
  `;
  const [r] = await conn.execute(sql, [userId, groupName]);

  return { userNutrientId: r.insertId, affectedRows: r.affectedRows }
};

// 사용자 영양소 섭취량 추가
async function insertUserNutrientIntakes(userNutrientId, nutrients, conn = pool) {
  const values = nutrients.map(({ nutrientId, intake }) => [
    userNutrientId,
    Number(nutrientId),
    Number(intake)
  ]);

  const sql = `
    INSERT INTO user_nutrient_intake (user_nutrient_id, nutrient_id, intake)
    VALUES ?
  `;
  const [r] = await conn.query(sql, [values]);
  
  return r.affectedRows;
};


/* ---------- UPDATE ---------- */

// 사용자 영양소 그룹 수정
async function updateUserNutrientGroup(userNutrientId, groupName, conn = pool) {
  const sql = `
    UPDATE user_nutrient
    SET nutrient_group_name = ?
    WHERE user_nutrient_id = ?
  `;
  const [r] = await conn.execute(sql, [groupName, userNutrientId]);

  return r.affectedRows;
};

// 사용자 영양소 섭취량 수정
async function updateUserNutrientIntakes(userNutrientId, nutrients, conn = pool) {
  const ids = [];
  const cases = [];
  const params = [];
  
  for (const { nutrientId, intake } of nutrients) {
    ids.push(nutrientId);
    cases.push(`WHEN ? THEN ?`);
    params.push(nutrientId, intake);
  }

  const sql = `
    UPDATE user_nutrient_intake
    SET intake = CASE nutrient_id
      ${cases.join(' ')}
      ELSE intake
    END
    WHERE user_nutrient_id = ? AND nutrient_id IN (${ids.map(() => '?').join(', ')})
  `;
  const [r] = await conn.execute(sql, [...params, userNutrientId, ...ids]);

  return r.affectedRows;
};


/* ---------- DELETE ---------- */

// 사용자 영양소 그룹 삭제
async function deleteUserNutrientGroup(userNutrientId) {
  const sql = `
    DELETE FROM user_nutrient
    WHERE user_nutrient_id = ?
  `;
  const [r] = await pool.execute(sql, [userNutrientId]);

  return r.affectedRows;
};


module.exports = {
  findUserProfileBasic,
  findUserNutrientIntakeStandards,
  findUserNutrientTotalIntake,
  findUserNutrientGroups,
  findUserNutrientGroupIntakes,
  insertUserNutrientGroup,
  insertUserNutrientIntakes,
  updateUserNutrientGroup,
  updateUserNutrientIntakes,
  deleteUserNutrientGroup
};