const BaseCache = require("./base.cache");

const { ServerError } = require("../../globals/helpers/error-handler");
const Helpers = require("../../globals/helpers/helpers");
const UserCache = require("./user.cache");
const { mongoose } = require("mongoose");

const userCache = new UserCache();

class FollowerCache extends BaseCache {
  constructor() {
    super("followersCache");
  }

  async saveFollowerToCache(key, value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async removeFollowerFromCache(key, value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async updateFollowersCountInCache(userId, prop, value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //get followers
  async getFollowersFromCache(key) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      //gets all followers for key and key=>followers:<userId>,key=>following:<userId>
      const response = await this.client.LRANGE(key, 0, -1);

      const list = [];
      //generate  following users data from followers id
      for (const item of response) {
        const user = await userCache.getUserFromCache(item);
        const data = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username,
          avatarColor: user.avatarColor,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId,
          userProfile: user,
        };
        list.push(data);
      }
      return list;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }
} //eoc

module.exports = FollowerCache;
