const userWorker = require("../../workers/user.worker");
const { BaseQueue } = require("./base.queue");

class UserQueue extends BaseQueue {
  constructor() {
    super("user");

    //process the job in queue
    this.processJob("addUserToDB", 5, userWorker.addUserToDB);
    this.processJob("updateBasicInfoInDB", 5, userWorker.updateUserInfo);
    this.processJob("updateSocialLinksInDB", 5, userWorker.updateSocialLinks);
    this.processJob(
      "updateNotificationSettings",
      5,
      userWorker.updateNotificationSettings
    );
  }

  //THis method adds Job to Queue

  addUserJob(name, data) {
    console.log("adding this to Q ", data);
    this.addJob(name, data);
  }
}
const userQueue = new UserQueue();

module.exports = userQueue;
