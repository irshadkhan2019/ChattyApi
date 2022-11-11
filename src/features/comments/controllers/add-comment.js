const ObjectId = require("mongodb").ObjectId;
const { StatusCodes } = require("http-status-codes");
const commentQueue = require("../../../shared/services/queues/comment.queue");
const CommentCache = require("../../../shared/services/redis/comment.cache");

const commentCache = new CommentCache();

class Add {
  async comment(req, res) {
    const { userTo, postId, profilePicture, comment } = req.body;
    const commentObjectId = new ObjectId();
    const commentData = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date(),
    };
    //save comment in cache
    await commentCache.savePostCommentToCache(
      postId,
      JSON.stringify(commentData)
    );

    const databaseCommentData = {
      postId,
      userTo,
      userFrom: req.currentUser?.userId,
      username: req.currentUser?.username,
      comment: commentData,
    };
    commentQueue.addCommentJob("addCommentToDB", databaseCommentData);
    res
      .status(StatusCodes.OK)
      .json({ message: "Comment created successfully" });
  }
}

module.exports = Add;
