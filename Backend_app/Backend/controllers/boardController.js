/* ========== 상담 게시판 ========== */

const {
  findBoardCategories,
  findUserBoards,
  findAllBoards,
  findBoardPostForEdit,
  findBoardPostReplyForEdit,
  insertBoardPost,
  insertBoardPostReply,
  updateBoardPost: updateBoardPostModel,
  updateBoardPostReply: updateBoardPostReplyModel,
  deleteBoardPost: deleteBoardPostModel,
  deleteBoardPostReply: deleteBoardPostReplyModel,
} = require('../models/boardModel');

const {
  buildBoardPostWithReplies
} = require('../services/boardService');


/* ---------- GET/LIST ---------- */

// 게시판 글 카테고리 목록 조회
const listBoardCategories = async (req, res) => {
  try {
    const categories = await findBoardCategories();

    return res.json({
      success: true,
      categories
    });

  } catch (err) {
    console.error('❌ listBoardCategories error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 게시판 글 목록 조회 (사용자)
const listUserBoards = async (req, res) => {
  try {
    const userId = req.params.userId;
    const boards = await findUserBoards(userId);

    return res.json({
      success: true,
      boards
    });

  } catch (err) {
    console.error('❌ listUserBoards error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 게시판 글 목록 조회 (보건 의료인)
const listAllBoards = async (req, res) => {
  try {
    const boards = await findAllBoards();

    return res.json({
      success: true,
      boards
    });

  } catch (err) {
    console.error('❌ listAllBoards error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 게시판 글 + 답변 조회 (사용자, 보건 의료인)
const getBoardPostWithReplies = async (req, res) => {
  try {
    const consultationPostId = req.params.consultationPostId;

    const postWithReplies = await buildBoardPostWithReplies(consultationPostId);

    return res.json({
      success: true,
      postWithReplies
    });

  } catch (err) {
    console.error('❌ getBoardPostWithReplies error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 수정용 게시판 글 조회 (사용자)
const getBoardPostForEdit = async (req, res) => {
  try {
    const consultationPostId = req.params.consultationPostId;

    const post = await findBoardPostForEdit(consultationPostId);

    return res.json({
      success: true,
      post
    });

  } catch (err) {
    console.error('❌ getBoardPostForEdit error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 수정용 게시판 글 답변 조회 (보건 의료인)
const getBoardPostReplyForEdit = async (req, res) => {
  try {
    const consultationReplyId = req.params.consultationReplyId;

    const reply = await findBoardPostReplyForEdit(consultationReplyId);

    return res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error('❌ getBoardPostReplyForEdit error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- CREATE ---------- */

// 게시판 글 작성 (사용자)
const createBoardPost = async (req, res) => {
  try {
    const userId = req.params.userId;
    const boardPost = req.body.boardPost;

    const result = await insertBoardPost(userId, boardPost);

    // 추가 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 추가 실패
    return res.json({
      success: false,
      message: '게시글 작성에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createBoardPost error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 게시판 글 답변 작성 (보건 의료인)
const createBoardPostReply = async (req, res) => {
  try {
    const consultationPostId = req.params.consultationPostId;
    const replyPayload = req.body.replyPayload;

    const result = await insertBoardPostReply(consultationPostId, replyPayload);

    // 추가 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 추가 실패
    return res.json({
      success: false,
      message: '답변 작성에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ createBoardPostReply error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- UPDATE ---------- */

// 게시판 글 수정 (사용자)
const updateBoardPost = async (req, res) => {
  try {
    const consultationPostId = req.params.consultationPostId;
    const boardPost = req.body.boardPost;

    const result = await updateBoardPostModel(consultationPostId, boardPost);

    // 수정 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 수정 실패
    return res.json({
      success: false,
      message: '게시글 수정에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ updateBoardPost error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 게시판 글 답변 수정 (보건 의료인)
const updateBoardPostReply = async (req, res) => {
  try {
    const consultationReplyId = req.params.consultationReplyId;
    const content = req.body.content;

    const result = await updateBoardPostReplyModel(consultationReplyId, content);

    // 수정 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 수정 실패
    return res.json({
      success: false,
      message: '답변 수정에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ updateBoardPostReply error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


/* ---------- DELETE ---------- */

// 게시판 글 삭제 (사용자)
const deleteBoardPost = async (req, res) => {
  try {
    const consultationPostId = req.params.consultationPostId;

    const result = await deleteBoardPostModel(consultationPostId);

    // 삭제 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 삭제 실패
    return res.json({
      success: false,
      message: '게시글 삭제에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteBoardPost error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 게시판 글 답변 삭제 (보건 의료인)
const deleteBoardPostReply = async (req, res) => {
  try {
    const consultationReplyId = req.params.consultationReplyId;

    const result = await deleteBoardPostReplyModel(consultationReplyId);

    // 삭제 성공
    if (result) {
      return res.json({
        success: true
      });
    }

    // 삭제 실패
    return res.json({
      success: false,
      message: '답변 삭제에 실패했습니다.'
    });

  } catch (err) {
    console.error('❌ deleteBoardPostReply error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};


module.exports = {
  listBoardCategories,
  listUserBoards,
  listAllBoards,
  getBoardPostWithReplies,
  getBoardPostForEdit,
  getBoardPostReplyForEdit,
  createBoardPost,
  createBoardPostReply,
  updateBoardPost,
  updateBoardPostReply,
  deleteBoardPost,
  deleteBoardPostReply
};