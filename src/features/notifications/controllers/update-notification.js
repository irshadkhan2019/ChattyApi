const { StatusCodes } = require("http-status-codes");
const notificationQueue = require("../../../shared/services/queues/notification.queue");
const {
  socketIONotificationObject,
} = require("../../../shared/sockets/notification");

class Update {
  async notification(req, res) {
    const { notificationId } = req.params;
    // socketIONotificationObject.emit("update notification", notificationId);
    notificationQueue.addNotificationJob("updateNotification", {
      notificationId,
    });

    res.status(StatusCodes.OK).json({ message: "Notification marked as read" });
  }
}
module.exports = Update;
