const reactionService = require("../services/db/reaction.service");

class ReactionWorker {
  //we get job and done callback fn as parameter when queue.process(name, concurrency, callback) is called .
  async addReactionToDB(job, done) {
    try {
      const { data } = job;
      await reactionService.addReactionDataToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async removeReactionFromDB(job, done) {
    try {
      const { data } = job;
      await reactionService.removeReactionDataFromDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const reactionWorker = new ReactionWorker();
module.exports = reactionWorker;
