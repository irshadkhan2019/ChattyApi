const authWorker = require("../../workers/auth.workers");
const { BaseQueue } = require("./base.queue");

class AuthQueue extends BaseQueue {
  constructor() {
    super("auth");

    //process the job in queue
    console.log("Processing Job...");
    this.processJob("addAuthUserToDB", 5, authWorker.addAuthUserToDB);
  }

  //THis method adds Job to Queue
  //eg  From user controller -> authQueue.addAuthUserJob("addAuthUserToDB", { value: userDataForCache });
  addAuthUserJob(name, data) {
    console.log("adding this to Q ", data);
    this.addJob(name, data);
  }
}
const authQueue = new AuthQueue();

module.exports = authQueue;
