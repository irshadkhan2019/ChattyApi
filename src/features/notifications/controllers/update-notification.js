const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const notificationQueue = require("../../../shared/services/queues/notification.queue");

class Update {
  async notification(req, res) {
    const { notificationId } = req.params;

    const socketIONotificationObject = getSocketServerInstance();
    socketIONotificationObject.emit("update notification", notificationId);
    notificationQueue.addNotificationJob("updateNotification", {
      notificationId,
    });

    res.status(StatusCodes.OK).json({ message: "Notification marked as read" });
  }
}
module.exports = Update;
