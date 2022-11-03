// const { DoneCallback } = require("bull");
const { config } = require("../../config");
const authService = require("../services/db/auth.service");

//consumer which will process the job
class AuthWorker {
  async addAuthUserToDB(job, done) {
    try {
      const { value } = job.data;

      //add method to send data to DB
      await authService.createAuthUser(value);

      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const authWorker = new AuthWorker();
module.exports = authWorker;
