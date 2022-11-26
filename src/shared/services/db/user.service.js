const { indexOf } = require("lodash");
const { mongoose } = require("mongoose");
const AuthModel = require("../../../features/auth/models/auth.schema");
const UserModel = require("../../../features/user/models/user.schema");
const followerService = require("./follower.service");

class UserService {
  //creates document in auth collection
  async addUserData(data) {
    await UserModel.create(data);
  }

  async getUserById(userId) {
    const users = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          // like populate it returns array containing all fields
          //from Auth model which have id same as users authId and
          // that array will be named as authId
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" }, // all elements from array created via above lookup are
      //added as an object in authId field  .
      { $project: this.aggregateProject() },
    ]);

    return users[0];
  }
  //
  async getUserByAuthId(authId) {
    const users = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      // {
      //   $lookup: {
      //     from: "Auth",
      //     localField: "authId",
      //     foreignField: "_id",
      //     as: "authId",
      //   },
      // },
      // { $unwind: "$authId" },
      // { $project: this.aggregateProject() },
    ]);

    console.log("From user service ", authId, users);
    return users[0];
  }

  async getAllUsers(userId, skip, limit) {
    const users = await UserModel.aggregate([
      //get all docs where id is not equal to loggedin User
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      { $project: this.aggregateProject() },
    ]);
    return users;
  }

  async getTotalUsersInDB() {
    const totalCount = await UserModel.find({}).countDocuments();
    return totalCount;
  }

  async getRandomUsers(userId) {
    const randomUsers = [];
    const users = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      { $sample: { size: 10 } }, //random 10 users
      {
        $addFields: {
          username: "$authId.username",
          email: "$authId.email",
          avatarColor: "$authId.avatarColor",
          uId: "$authId.uId",
          createdAt: "$authId.createdAt",
        },
      },
      {
        $project: {
          authId: 0,
          __v: 0,
        },
      },
    ]);

    const followers = await followerService.getFolloweesIds(`${userId}`);

    for (const user of users) {
      const followerIndex = indexOf(followers, user._id.toString());
      if (followerIndex < 0) {
        //push users who are not already followed by userId
        randomUsers.push(user);
      }
    }
    return randomUsers;
  }

  async searchUsers(regex) {
    const users = await AuthModel.aggregate([
      { $match: { username: regex } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "authId",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1,
        },
      },
    ]);
    return users;
  }

  aggregateProject() {
    return {
      _id: 1,
      username: "$authId.username",
      uId: "$authId.uId",
      email: "$authId.email",
      avatarColor: "$authId.avatarColor",
      createdAt: "$authId.createdAt",
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1,
    };
  }
}
const userService = new UserService();

module.exports = userService;
