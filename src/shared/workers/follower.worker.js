const followerService = require("../services/db/follower.service");

class FollowerWorker {
  async addFollowerToDB(job, done) {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = job.data;
      //key1=loggedinuser
      //key2=Other user
      await followerService.addFollowerToDB(
        keyOne,
        keyTwo,
        username,
        followerDocumentId
      );
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async removeFollowerFromDB(job, done) {
    try {
      const { keyOne, keyTwo } = job.data;
      await followerService.removeFollowerFromDB(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}

const followerWorker = new FollowerWorker();
module.exports = followerWorker;
