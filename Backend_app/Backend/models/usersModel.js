/* ========== 사용자 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 로그인
async function findUser(userId, userPassword) {
	const sql = `
		SELECT user_id, user_name, role
		FROM users
		WHERE user_id = ? AND user_password = ?
	`;
	const [rows] = await pool.execute(sql, [userId, userPassword]);
	const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};

// 사용자 정보 조회
async function findUserInfo(userId) {
	const sql = `
		SELECT user_name, phone_number, birthday, gender, pregnant_flag, feeding_flag
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

// 사용자 패스워드 조회
async function findUserPassword(userId) {
	const sql = `
		SELECT user_password
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

// 회원가입
async function insertUser(u) {
	const sql = `
		INSERT INTO users(user_id, user_password, user_name, phone_number, birthday, gender, pregnant_flag, feeding_flag)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?)
	`;
	const params = [
	u.email, u.password, u.name, u.phonenumber,
	u.birth, u.gender,
	u.pregnant ? 1 : 0, u.feeding ? 1 : 0,
	];
	const [r] = await pool.execute(sql, params);

	return r.affectedRows;
}


/* ---------- UPDATE ---------- */

// 사용자 정보 수정
async function updateUserInfo(userId, u) {
	const sql = `
		UPDATE users
		SET user_name = ?, phone_number = ?, birthday = ?, gender = ?, pregnant_flag = ?, feeding_flag = ?
		WHERE user_id = ?
	`;
	const params = [
		u.userName, u.phoneNumber, u.birthday, u.gender,
		u.pregnantFlag ? 1 : 0, u.feedingFlag ? 1 : 0,
		userId
	];
	const [r] = await pool.execute(sql, params);

	return r.affectedRows;
};

// 사용자 패스워드 변경
async function updateUserPassword(userId, newPassword) {
	const sql = `
		UPDATE users
		SET user_password = ?
		WHERE user_id = ?
	`;
	const [r] = await pool.execute(sql, [newPassword, userId]);

	return r.affectedRows;
};


/* ---------- DELETE ---------- */

// 사용자 탈퇴
async function deleteUser(userId) {
	const sql = `
		DELETE FROM users
		WHERE user_id = ?
	`;
	const [r] = await pool.execute(sql, [userId]);

	return r.affectedRows;
};



module.exports = {
	findUser,
	findUserInfo,
	findUserPassword,
	insertUser,
	updateUserInfo,
	updateUserPassword,
	deleteUser
};