const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const postQueue = require("../../../shared/services/queues/post.queue");
const PostCache = require("../../../shared/services/redis/post.cache");

const postCache = new PostCache();

class Delete {
  async post(req, res) {
    const socketIOPostObject = getSocketServerInstance();
    socketIOPostObject.emit("delete post", req.params.postId);
    await postCache.deletePostFromCache(
      req.params.postId,
      `${req.currentUser?.userId}`
    );
    //delete from db
    postQueue.addPostJob("deletePostFromDB", {
      postId: req.params.postId,
      userId: req.currentUser?.userId,
    });

    res.status(StatusCodes.OK).json({ message: "post deleted Successfully" });
  }
}

module.exports = Delete;
