const ObjectId = require("mongodb").ObjectId;
const { StatusCodes } = require("http-status-codes");
const commentService = require("../../../shared/services/db/comment.service");
const commentQueue = require("../../../shared/services/queues/comment.queue");
const CommentCache = require("../../../shared/services/redis/comment.cache");

const commentCache = new CommentCache();

class Get {
  async comments(req, res) {
    const { postId } = req.params;
    const cachedComments = await commentCache.getCommentsFromCache(postId);
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments(
          //pass the query
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );

    res.status(StatusCodes.OK).json({ message: "Post comments", comments });
  }

  async commentsNamesFromCache(req, res) {
    const { postId } = req.params;
    const cachedCommentsNames = await commentCache.getCommentsNamesFromCache(
      postId
    );
    const commentsNames = cachedCommentsNames.length
      ? cachedCommentsNames
      : await commentService.getPostCommentNames(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );

    res.status(StatusCodes.OK).json({
      message: "Post comments names",
      comments: commentsNames.length ? commentsNames[0] : [],
    });
  }

  async singleComment(req, res) {
    const { postId, commentId } = req.params;
    const cachedComments = await commentCache.getSingleCommentFromCache(
      postId,
      commentId
    );
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments(
          { _id: new mongoose.Types.ObjectId(commentId) },
          { createdAt: -1 }
        );

    res.status(StatusCodes.OK).json({
      message: "Single comment",
      comments: comments.length ? comments[0] : [],
    });
  }
}

module.exports = Get;
