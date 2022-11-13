const { StatusCodes } = require("http-status-codes");
const blockedUserQueue = require("../../../shared/services/queues/blocked.queue");
const FollowerCache = require("../../../shared/services/redis/follower.cache");

const followerCache = new FollowerCache();
class AddUser {
  async block(req, res) {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockedUser(
      followerId,
      req.currentUser?.userId,
      "block"
    );
    blockedUserQueue.addBlockedUserJob("addBlockedUserToDB", {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      type: "block",
    });
    res.status(StatusCodes.OK).json({ message: "User blocked" });
  }

  async unblock(req, res) {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockedUser(
      followerId,
      req.currentUser?.userId,
      "unblock"
    );
    blockedUserQueue.addBlockedUserJob("removeBlockedUserFromDB", {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      type: "unblock",
    });
    res.status(StatusCodes.OK).json({ message: "User unblocked" });
  }

  async updateBlockedUser(followerId, userId, type) {
    const blocked = followerCache.updateBlockedUserPropInCache(
      `${userId}`,
      "blocked",
      `${followerId}`,
      type
    );
    const blockedBy = followerCache.updateBlockedUserPropInCache(
      `${followerId}`,
      "blockedBy",
      `${userId}`,
      type
    );
    await Promise.all([blocked, blockedBy]);
  }
}
module.exports = AddUser;
