const { findIndex, indexOf } = require("lodash");
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

  async getUsersFromCache(start, end, excludedUserKey) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response = await this.client.ZRANGE("user", start, end, {
        REV: true,
      });
      const multi = this.client.multi();

      //get all usersId based on pagination except loggedin userid
      for (const key of response) {
        if (key !== excludedUserKey) {
          multi.HGETALL(`users:${key}`);
        }
      }

      //get all users except loggedin user
      const replies = await multi.exec();
      const userReplies = [];

      for (const reply of replies) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
        reply.work = Helpers.parseJson(`${reply.work}`);
        reply.school = Helpers.parseJson(`${reply.school}`);
        reply.location = Helpers.parseJson(`${reply.location}`);
        reply.quote = Helpers.parseJson(`${reply.quote}`);

        userReplies.push(reply);
      }
      return userReplies;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
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

  async getTotalUsersInCache() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count = await this.client.ZCARD("user");
      return count;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //random users
  async getRandomUsersFromCache(userId, excludedUsername) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const replies = [];
      const followers = await this.client.LRANGE(`followers:${userId}`, 0, -1);
      const users = await this.client.ZRANGE("user", 0, -1);

      //shuffle the users
      const randomUsers = Helpers.shuffle(users).slice(0, 10);

      for (const key of randomUsers) {
        //check if the user/key is also in followers list
        const followerIndex = indexOf(followers, key);
        //if user not in followers list
        if (followerIndex < 0) {
          const userHash = await this.client.HGETALL(`users:${key}`);
          replies.push(userHash);
        }
      }
      const excludedUsernameIndex = findIndex(replies, [
        "username",
        excludedUsername,
      ]);
      //remove loggedIn user if it exists in list
      replies.splice(excludedUsernameIndex, 1);

      for (const reply of replies) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
        reply.work = Helpers.parseJson(`${reply.work}`);
        reply.school = Helpers.parseJson(`${reply.school}`);
        reply.location = Helpers.parseJson(`${reply.location}`);
        reply.quote = Helpers.parseJson(`${reply.quote}`);
      }
      return replies;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }
}

module.exports = UserCache;
