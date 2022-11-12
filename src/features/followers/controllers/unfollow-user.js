const { StatusCodes } = require("http-status-codes");
const followerQueue = require("../../../shared/services/queues/follower.queue");
const FollowerCache = require("../../../shared/services/redis/follower.cache");

const followerCache = new FollowerCache();

class Remove {
  async follower(req, res) {
    //followeeId:other user
    //followerId:loggedin user
    const { followeeId, followerId } = req.params;

    const removeFollowerFromCache = followerCache.removeFollowerFromCache(
      `following:${req.currentUser?.userId}`,
      followeeId
    );
    const removeFolloweeFromCache = followerCache.removeFollowerFromCache(
      `followers:${followeeId}`,
      followerId
    );

    const followersCount = followerCache.updateFollowersCountInCache(
      `${followeeId}`, //other users have 1 less follower
      "followersCount",
      -1
    );
    const followeeCount = followerCache.updateFollowersCountInCache(
      `${followerId}`,
      "followingCount", //logged in user has 1 less following
      -1
    );
    await Promise.all([
      removeFollowerFromCache,
      removeFolloweeFromCache,
      followersCount,
      followeeCount,
    ]);

    followerQueue.addFollowerJob("removeFollowerFromDB", {
      keyOne: `${followeeId}`, //other
      keyTwo: `${followerId}`, //loggedin
    });
    res.status(StatusCodes.OK).json({ message: "Unfollowed user now" });
  }
}

module.exports = Remove;
