/* ========== 상담 게시판 ========== */

const pool = require('../db/connection').promise();
const { camelizeRow, camelizeRows } = require('../utils/camelize')


/* ---------- SELECT ---------- */

// 게시판 글 카테고리 목록 조회
async function findBoardCategories() {
  const sql = `
    SELECT category_id, category_name
    FROM category
  `;
  const [rows] = await pool.execute(sql);
  const list = camelizeRows(rows);

  return list;
};

// 게시판 목록 조회 (사용자)
async function findUserBoards(userId) {
  const sql = `
    SELECT cp.consultation_post_id, c.category_name, cp.title, cp.post_date, cp.update_date
    FROM consultation_post cp
    JOIN category c ON cp.category_id = c.category_id
    WHERE cp.user_id = ?
    ORDER BY cp.post_date DESC
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const list = camelizeRows(rows);

  return list;
};

// 게시판 목록 조회 (보건 의료인)
async function findAllBoards() {
  const sql = `
    SELECT cp.consultation_post_id, c.category_name, cp.title, cp.post_date, cp.update_date
    FROM consultation_post cp
    JOIN category c ON cp.category_id = c.category_id
    ORDER BY cp.post_date DESC
  `;
  const [rows] = await pool.execute(sql);
  const list = camelizeRows(rows);

  return list;
};

// 게시판 글 조회 (사용자, 보건 의료인)
async function findBoardPost(consultationPostId) {
  const sql = `
    SELECT cp.consultation_post_id, c.category_name, cp.title, cp.content, cp.post_date, cp.update_date
    FROM consultation_post cp
    JOIN category c ON cp.category_id = c.category_id
    WHERE cp.consultation_post_id = ?
  `;
  const [rows] = await pool.execute(sql, [consultationPostId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};

// 게시판 글 답변 조회 (사용자, 보건 의료인)
async function findBoardPostReplies(consultationPostId) {
  const sql = `
    SELECT cr.consultation_reply_id, cr.user_id, cr.content, cr.reply_date, cr.update_date, hp.classification, hp.medical_institution, u.user_name
    FROM consultation_reply cr
    JOIN users u ON cr.user_id = u.user_id
    JOIN health_profession hp ON u.user_id = hp.user_id
    WHERE cr.consultation_post_id = ?
  `;
  const [rows] = await pool.execute(sql, [consultationPostId]);
  const list = camelizeRows(rows);

  return list;
};

// 수정용 게시판 글 조회 (사용자)
async function findBoardPostForEdit(consultationPostId) {
  const sql = `
    SELECT consultation_post_id, category_id, title, content
    FROM consultation_post
    WHERE consultation_post_id = ?
  `;
  const [rows] = await pool.execute(sql, [consultationPostId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};

// 수정용 게시판 글 답변 조회 (보건 의료인)
async function findBoardPostReplyForEdit(consultationReplyId) {
  const sql = `
    SELECT consultation_reply_id, content
    FROM consultation_reply
    WHERE consultation_reply_id = ?
  `;
  const [rows] = await pool.execute(sql, [consultationReplyId]);
  const row = rows[0] ?? null;

  if (!row) return null;

  const record = camelizeRow(row);

  return record;
};


/* ---------- INSERT ---------- */

// 게시판 글 작성 (사용자)
async function insertBoardPost(userId, p) {
  const sql = `
    INSERT INTO consultation_post(user_id, category_id, title, content)
    VALUES (?, ?, ?, ?)
  `;
  const params = [
    userId, p.categoryId, p.title, p.content
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows;
};

// 게시판 글 답변 작성 (보건 의료인)
async function insertBoardPostReply(consultationPostId, re) {
  const sql = `
    INSERT INTO consultation_reply(consultation_post_id, user_id, content)
    VALUES (?, ?, ?)
  `;
  const params = [
    consultationPostId, re.userId, re.content
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows
};


/* ---------- UPDATE ---------- */

// 게시글 수정 (사용자)
async function updateBoardPost(consultationPostId, p) {
  const sql = `
    UPDATE consultation_post
    SET category_id = ?, title = ?, content = ?
    WHERE consultation_post_id = ?
  `;
  const params = [
    p.categoryId, p.title, p.content, consultationPostId
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows;
};

// 게시글 답변 수정 (보건 의료인)
async function updateBoardPostReply(consultationReplyId, content) {
  const sql = `
    UPDATE consultation_reply
    SET content = ?
    WHERE consultation_reply_id = ?
  `;
  const params = [
    content, consultationReplyId
  ];
  const [r] = await pool.execute(sql, params);

  return r.affectedRows;
};


/* ---------- DELETE ---------- */

// 게시글 삭제 (사용자)
async function deleteBoardPost(consultationPostId) {
  const sql = `
    DELETE FROM consultation_post
    WHERE consultation_post_id = ?
  `;
  const [r] = await pool.execute(sql, [consultationPostId]);

  return r.affectedRows;
};

// 게시글 답변 삭제 (보건 의료인)
async function deleteBoardPostReply(consultationReplyId) {
  const sql = `
    DELETE FROM consultation_reply
    WHERE consultation_reply_id = ?
  `;
  const [r] = await pool.execute(sql, [consultationReplyId]);

  return r.affectedRows;
};


module.exports = {
  findBoardCategories,
  findUserBoards,
  findAllBoards,
  findBoardPost,
  findBoardPostReplies,
  findBoardPostForEdit,
  findBoardPostReplyForEdit,
  insertBoardPost,
  insertBoardPostReply,
  updateBoardPost,
  updateBoardPostReply,
  deleteBoardPost,
  deleteBoardPostReply
};