const { config } = require("../../config");
const userService = require("../services/db/user.service");

//consumer which will process the job
class UserWorker {
  async addUserToDB(job, done) {
    try {
      const { value } = job.data;

      //add method to send data to DB
      await userService.addUserData(value);

      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const userWorker = new UserWorker();
module.exports = userWorker;
