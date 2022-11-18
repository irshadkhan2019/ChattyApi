const { ServerError } = require("../../globals/helpers/error-handler");
const Helpers = require("../../globals/helpers/helpers");
const BaseCache = require("./base.cache");

class UserCache extends BaseCache {
  constructor() {
    super("userCache");
  }

  async saveUserToCache(key, userUId, createdUser) {
    const createdAt = new Date();
    //destructuring
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social,
    } = createdUser;

    //redis format
    const firstList = [
      "_id",
      `${_id}`,
      "uId",
      `${uId}`,
      "username",
      `${username}`,
      "email",
      `${email}`,
      "avatarColor",
      `${avatarColor}`,
      "createdAt",
      `${createdAt}`,
      "postsCount",
      `${postsCount}`,
    ];
    const secondList = [
      "blocked",
      JSON.stringify(blocked),
      "blockedBy",
      JSON.stringify(blockedBy),
      "profilePicture",
      `${profilePicture}`,
      "followersCount",
      `${followersCount}`,
      "followingCount",
      `${followingCount}`,
      "notifications",
      JSON.stringify(notifications),
      "social",
      JSON.stringify(social),
    ];
    const thirdList = [
      "work",
      `${work}`,
      "location",
      `${location}`,
      "school",
      `${school}`,
      "quote",
      `${quote}`,
      "bgImageVersion",
      `${bgImageVersion}`,
      "bgImageId",
      `${bgImageId}`,
    ];

    const dataToSave = [...firstList, ...secondList, ...thirdList];

    //save data  in redis
    try {
      //of no connection to redis
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //RAW redis command
      await this.client.ZADD("user", {
        score: parseInt(userUId, 10),
        value: `${key}`,
      });

      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      console.log(error);
      throw new ServerError("server Error. try again");
    }
  }

  async getUserFromCache(userId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      let response = await this.client.HGETALL(`users:${userId}`);

      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.postsCount = Helpers.parseJson(`${response.postsCount}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.social = Helpers.parseJson(`${response.social}`);
      response.followersCount = Helpers.parseJson(`${response.followersCount}`);
      response.followingCount = Helpers.parseJson(`${response.followingCount}`);
      response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
      response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
      response.profilePicture = Helpers.parseJson(`${response.profilePicture}`);
      response.work = Helpers.parseJson(`${response.work}`);
      response.school = Helpers.parseJson(`${response.school}`);
      response.location = Helpers.parseJson(`${response.location}`);
      response.quote = Helpers.parseJson(`${response.quote}`);

      return response;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error try again .");
    }
  }

  async updateSingleUserItemInCache(userId, prop, value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dataToSave = [`${prop}`, JSON.stringify(value)];
      await this.client.HSET(`users:${userId}`, dataToSave);

      const response = await this.getUserFromCache(`${userId}`);
      return response;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error try again .");
    }
  }
}

module.exports = UserCache;
