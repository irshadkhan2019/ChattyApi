const emailWorker = require("../../workers/email.worker");
const { BaseQueue } = require("./base.queue");

class EmailQueue extends BaseQueue {
  constructor() {
    super("emails");
    this.processJob("forgotPasswordEmail", 5, emailWorker.addNotificationEmail);
  }

  addEmailJob(name, data) {
    this.addJob(name, data);
  }
}

const emailQueue = new EmailQueue();

module.exports = emailQueue;
