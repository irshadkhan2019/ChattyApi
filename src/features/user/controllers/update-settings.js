const { StatusCodes } = require("http-status-codes");
const userQueue = require("../../../shared/services/queues/user.queue");
const UserCache = require("../../../shared/services/redis/user.cache");

const userCache = new UserCache();

class UpdateSettings {
  async notification(req, res) {
    await userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "notifications",
      req.body
    );

    userQueue.addUserJob("updateNotificationSettings", {
      userId: `${req.currentUser?.userId}`,
      settings: req.body,
    });

    res.status(StatusCodes.OK).json({
      message: "Notification settings updated successfully",
      settings: req.body,
    });
  }
}

module.exports = UpdateSettings;
