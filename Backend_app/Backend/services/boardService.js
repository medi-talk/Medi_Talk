/* ========== 상담 게시판 ========== */

const pool = require('../db/connection').promise();

const {
  findBoardPost,
  findBoardPostReplies,
} = require('../models/boardModel');


// 게시판 글 + 답변 조회 (사용자, 보건 의료인)
async function buildBoardPostWithReplies(consultationPostId) {
  const post = await findBoardPost(consultationPostId);
  if (!post) return null;

  const replies = await findBoardPostReplies(consultationPostId);

  return {
    consultationPostId: post.consultationPostId,
    categoryName: post.categoryName,
    title: post.title,
    content: post.content,
    postDate: post.postDate,
    updateDate: post.updateDate,
    replies
  }
};


module.exports = {
  buildBoardPostWithReplies
};