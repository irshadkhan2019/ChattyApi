const commentWorker = require("../../workers/comment.worker");
const { BaseQueue } = require("./base.queue");

class CommentQueue extends BaseQueue {
  constructor() {
    super("comments");
    this.processJob("addCommentToDB", 5, commentWorker.addCommentToDB);
  }

  addCommentJob(name, data) {
    this.addJob(name, data);
  }
}

const commentQueue = new CommentQueue();
module.exports = commentQueue;
