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

  async updateUserInfo(job, done) {
    try {
      const { userId, info } = job.data;
      await userService.updateUserInfo(userId, info);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async updateSocialLinks(job, done) {
    try {
      const { userId, links } = job.data;
      await userService.updateSocialLinks(userId, links);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error);
    }
  }

  async updateNotificationSettings(job, done) {
    try {
      const { userId, settings } = job.data;
      await userService.updateNotificationSettings(userId, settings);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const userWorker = new UserWorker();
module.exports = userWorker;
