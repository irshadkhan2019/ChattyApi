const authWorker = require("../../workers/auth.workers");
const { BaseQueue } = require("./base.queue");

class AuthQueue extends BaseQueue {
  constructor() {
    super("auth");

    //process the job in queue
    this.processJob("addAuthUserToDB", 5, authWorker.addAuthUserToDB);
  }

  //THis method adds Job to Queue
  addAuthUserJob(name, data) {
    console.log("adding this to Q ", data);
    this.addJob(name, data);
  }
}
const authQueue = new AuthQueue();

module.exports = authQueue;
