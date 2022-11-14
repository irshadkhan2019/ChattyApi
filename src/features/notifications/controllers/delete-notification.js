const { StatusCodes } = require("http-status-codes");
const notificationQueue = require("../../../shared/services/queues/notification.queue");
const {
  socketIONotificationObject,
} = require("../../../shared/sockets/notification");

class Delete {
  async notification(req, res) {
    const { notificationId } = req.params;
    // socketIONotificationObject.emit("delete notification", notificationId);
    notificationQueue.addNotificationJob("deleteNotification", {
      notificationId,
    });
    res
      .status(StatusCodes.OK)
      .json({ message: "Notification deleted successfully" });
  }
}
module.exports = Delete;
