const postWorker = require("../../workers/post.worker");
const { BaseQueue } = require("./base.queue");

class PostQueue extends BaseQueue {
  constructor() {
    super("posts");
    this.processJob("addPostToDB", 5, postWorker.addPostToDB);
    this.processJob("deletePostFromDB", 5, postWorker.deletePostFromDB);
    this.processJob("updatePostInDB", 5, postWorker.updatePostInDB);
  }

  addPostJob(name, data) {
    this.addJob(name, data);
  }
}

const postQueue = new PostQueue();
module.exports = postQueue;
