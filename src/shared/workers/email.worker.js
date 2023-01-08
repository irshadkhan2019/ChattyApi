const { config } = require("../../config");
const mailTransport = require("../services/emails/mail.transport");

//consumer which will process the job
class EmailWorker {
  //we get job and done callback fn as parameter when queue.process(name, concurrency, callback) is called .
  async addNotificationEmail(job, done) {
    try {
      const { template, receiverEmail, subject } = job.data;

      //add method to send email
      await mailTransport.sendEmail(receiverEmail, subject, template);

      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const emailWorker = new EmailWorker();
module.exports = emailWorker;
