const notificationWorker = require("../../workers/notification.worker");
const { BaseQueue } = require("./base.queue");

class NotificationQueue extends BaseQueue {
  constructor() {
    super("notification");
    this.processJob(
      "updateNotification",
      5,
      notificationWorker.updateNotification
    );
    this.processJob(
      "deleteNotification",
      5,
      notificationWorker.deleteNotification
    );
  }

  addNotificationJob(name, data) {
    this.addJob(name, data);
  }
}
const notificationQueue = new NotificationQueue();
module.exports = notificationQueue;
