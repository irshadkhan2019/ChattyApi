const { StatusCodes } = require("http-status-codes");
const userQueue = require("../../../shared/services/queues/user.queue");
const UserCache = require("../../../shared/services/redis/user.cache");

const userCache = new UserCache();

class Edit {
  async info(req, res) {
    for (const [key, value] of Object.entries(req.body)) {
      await userCache.updateSingleUserItemInCache(
        `${req.currentUser?.userId}`,
        key,
        `${value}`
      );
    }

    userQueue.addUserJob("updateBasicInfoInDB", {
      userId: `${req.currentUser?.userId}`,
      info: req.body,
    });
    res.status(StatusCodes.OK).json({ message: "Updated successfully" });
  }

  async social(req, res) {
    await userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "social",
      req.body
    );
    userQueue.addUserJob("updateSocialLinksInDB", {
      userId: `${req.currentUser?.userId}`,
      links: req.body,
    });
    res.status(StatusCodes.OK).json({ message: "Updated successfully" });
  }
}

module.exports = Edit;
