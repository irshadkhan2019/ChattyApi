const reactionWorker = require("../../workers/reaction.worker");
const { BaseQueue } = require("./base.queue");

class ReactionQueue extends BaseQueue {
  constructor() {
    super("reaction");

    //process the job in queue
    this.processJob("addReactionToDB", 5, reactionWorker.addReactionToDB);
    this.processJob(
      "removeReactionFromDB",
      5,
      reactionWorker.removeReactionFromDB
    );
  }

  //THis method adds Job to Queue

  addReactionJob(name, data) {
    this.addJob(name, data);
  }
}
const reactionQueue = new ReactionQueue();

module.exports = reactionQueue;
