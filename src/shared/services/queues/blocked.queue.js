const blockedUserWorker = require("../../workers/blocked.worker");
const { BaseQueue } = require("./base.queue");

class BlockedUserQueue extends BaseQueue {
  constructor() {
    super("blockedUsers");
    this.processJob(
      "addBlockedUserToDB",
      5,
      blockedUserWorker.addBlockedUserToDB
    );
    this.processJob(
      "removeBlockedUserFromDB",
      5,
      blockedUserWorker.addBlockedUserToDB
    );
  }

  addBlockedUserJob(name, data) {
    this.addJob(name, data);
  }
}

const blockedUserQueue = new BlockedUserQueue();
module.exports = blockedUserQueue;
