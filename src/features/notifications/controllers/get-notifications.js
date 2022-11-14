const { StatusCodes } = require("http-status-codes");
const notificationService = require("../../../shared/services/db/notification.service");

class Get {
  async notifications(req, res) {
    const notifications = await notificationService.getNotifications(
      req.currentUser?.userId
    );
    res
      .status(StatusCodes.OK)
      .json({ message: "User notifications", notifications });
  }
}
module.exports = Get;
