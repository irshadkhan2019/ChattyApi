const { StatusCodes } = require("http-status-codes");
const { mongoose } = require("mongoose");
const followerService = require("../../../shared/services/db/follower.service");
const FollowerCache = require("../../../shared/services/redis/follower.cache");
const followerCache = new FollowerCache();

class Get {
  //get all users follower by logged in user
  async userFollowing(req, res) {
    const userObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);
    const cachedFollowees = await followerCache.getFollowersFromCache(
      `following:${req.currentUser?.userId}`
    );
    const following = cachedFollowees.length
      ? cachedFollowees
      : await followerService.getFolloweedata(userObjectId);
    res.status(StatusCodes.OK).json({ message: "User following", following });
  }

  //get followers of an user
  async userFollowers(req, res) {
    const userObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers = await followerCache.getFollowersFromCache(
      `followers:${req.params.userId}`
    );
    const followers = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowerData(userObjectId);
    res.status(StatusCodes.OK).json({ message: "User followers", followers });
  }
}

module.exports = Get;
