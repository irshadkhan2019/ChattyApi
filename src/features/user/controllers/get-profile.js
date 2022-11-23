const { StatusCodes } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const followerService = require("../../../shared/services/db/follower.service");
const userService = require("../../../shared/services/db/user.service");
const FollowerCache = require("../../../shared/services/redis/follower.cache");
const PostCache = require("../../../shared/services/redis/post.cache");
const UserCache = require("../../../shared/services/redis/user.cache");

const postCache = new PostCache();
const userCache = new UserCache();
const followerCache = new FollowerCache();

const PAGE_SIZE = 10;

class Get {
  async all(req, res) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page);
    const newSkip = skip === 0 ? skip : skip + 1;
    const allUsers = await Get.prototype.allUsers({
      newSkip,
      limit,
      skip,
      userId: `${req.currentUser?.userId}`,
    });

    const followers = await Get.prototype.followers(
      `${req.currentUser?.userId}`
    );
    res.status(StatusCodes.OK).json({
      message: "Get users",
      users: allUsers.users,
      totalUsers: allUsers.totalUsers,
      followers,
    });
  }

  async allUsers({ newSkip, limit, skip, userId }) {
    let users;
    let type = "";
    const cachedUsers = await userCache.getUsersFromCache(
      newSkip,
      limit,
      userId
    );
    if (cachedUsers.length) {
      type = "redis";
      users = cachedUsers;
    } else {
      type = "mongodb";
      users = await userService.getAllUsers(userId, skip, limit);
    }
    const totalUsers = await Get.prototype.usersCount(type);
    return { users, totalUsers };
  }
  async usersCount(type) {
    const totalUsers =
      type === "redis"
        ? await userCache.getTotalUsersInCache()
        : await userService.getTotalUsersInDB();
    return totalUsers;
  }

  async followers(userId) {
    const cachedFollowers = await followerCache.getFollowersFromCache(
      `followers:${userId}`
    );
    const result = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowerData(
          new mongoose.Types.ObjectId(userId)
        );
    return result;
  }
}
module.exports = Get;
