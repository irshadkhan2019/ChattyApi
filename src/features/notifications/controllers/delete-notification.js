const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const notificationQueue = require("../../../shared/services/queues/notification.queue");

class Delete {
  async notification(req, res) {
    const { notificationId } = req.params;

    const socketIONotificationObject = getSocketServerInstance();
    socketIONotificationObject.emit("delete notification", notificationId);

    notificationQueue.addNotificationJob("deleteNotification", {
      notificationId,
    });
    res
      .status(StatusCodes.OK)
      .json({ message: "Notification deleted successfully" });
  }
}
module.exports = Delete;
