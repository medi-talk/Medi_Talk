/* ========== 상담 게시판 ========== */

const express = require('express');
const router = express.Router();

const { 
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
} = require('../controllers/boardController');


/* ---------- GET ---------- */
router.get('/listBoardCategories', listBoardCategories);
router.get('/listUserBoards/:userId', listUserBoards);
router.get('/listAllBoards', listAllBoards);
router.get('/getBoardPostWithReplies/:consultationPostId', getBoardPostWithReplies);
router.get('/getBoardPostForEdit/:consultationPostId', getBoardPostForEdit);
router.get('/getBoardPostReplyForEdit/:consultationReplyId', getBoardPostReplyForEdit);

/* ---------- POST ---------- */
router.post('/createBoardPost/:userId', createBoardPost);
router.post('/createBoardPostReply/:consultationPostId', createBoardPostReply);

/* ---------- PUT ---------- */
router.put('/updateBoardPost/:consultationPostId', updateBoardPost);
router.put('/updateBoardPostReply/:consultationReplyId', updateBoardPostReply);

/* ---------- DELETE ---------- */
router.delete('/deleteBoardPost/:consultationPostId', deleteBoardPost);
router.delete('/deleteBoardPostReply/:consultationReplyId', deleteBoardPostReply);


module.exports = router;