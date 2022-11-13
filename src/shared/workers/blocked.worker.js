const blockUserService = require("../services/db/block-user.service");

class BlockedUserWorker {
  async addBlockedUserToDB(job, done) {
    try {
      const { keyOne, keyTwo, type } = job.data;
      if (type === "block") {
        await blockUserService.blockUser(keyOne, keyTwo);
      } else {
        await blockUserService.unblockUser(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}

const blockedUserWorker = new BlockedUserWorker();
module.exports = blockedUserWorker;
