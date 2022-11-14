const { config } = require("../../config");
const notificationService = require("../services/db/notification.service");

class NotificationWorker {
  async updateNotification(job, done) {
    try {
      const { notificationId } = job.data;
      await notificationService.updateNotification(notificationId);
      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
  async deleteNotification(job, done) {
    try {
      const { notificationId } = job.data;
      await notificationService.deleteNotification(notificationId);
      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const notificationWorker = new NotificationWorker();
module.exports = notificationWorker;
