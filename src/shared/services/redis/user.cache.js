const { ServerError } = require("../../globals/helpers/error-handler");
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
}

module.exports = UserCache;
