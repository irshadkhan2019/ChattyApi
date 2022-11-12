const followerWorker = require("../../workers/follower.worker");
const { BaseQueue } = require("./base.queue");

class FollowerQueue extends BaseQueue {
  constructor() {
    super("followers");
    this.processJob("addFollowerToDB", 5, followerWorker.addFollowerToDB);
    this.processJob(
      "removeFollowerFromDB",
      5,
      followerWorker.removeFollowerFromDB
    );
  }

  addFollowerJob(name, data) {
    this.addJob(name, data);
  }
}
const followerQueue = new FollowerQueue();
module.exports = followerQueue;
