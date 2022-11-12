const BaseCache = require("./base.cache");

const { ServerError } = require("../../globals/helpers/error-handler");
const Helpers = require("../../globals/helpers/helpers");
const UserCache = require("./user.cache");

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
} //eoc

module.exports = FollowerCache;
