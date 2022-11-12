const { mongoose } = require("mongoose");
const FollowerModel = require("../../../features/followers/models/follower.schema");
const UserModel = require("../../../features/user/models/user.schema");
const UserCache = require("../redis/user.cache");

const userCache = new UserCache();

class FollowerService {
  async addFollowerToDB(userId, followeeId, username, followerDocumentId) {
    const followeeObjectId = new mongoose.Types.ObjectId(followeeId); //Other user
    const followerObjectId = new mongoose.Types.ObjectId(userId); //loggedin user

    //create doc
    const following = await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    });

    //update users followers and followings
    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId }, //logged in users inc following count
          update: { $inc: { followingCount: 1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId }, //other user inc folowwers count
          update: { $inc: { followersCount: 1 } },
        },
      },
    ]);

    const response = await Promise.all([
      users,
      userCache.getUserFromCache(followeeId),
    ]);
  } //eof

  async removeFollowerFromDB(followeeId, followerId) {
    const followeeObjectId = new mongoose.Types.ObjectId(followeeId); //other user
    const followerObjectId = new mongoose.Types.ObjectId(followerId); //logged in

    const unfollow = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    });

    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } },
        },
      },
    ]);

    await Promise.all([unfollow, users]);
  }

  //for a user get Ones who are being followed by him.
  async getFolloweedata(userObjectId) {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      {
        $lookup: {
          from: "User",
          localField: "followeeId",
          foreignField: "_id",
          as: "followeeId",
        },
      },
      { $unwind: "$followeeId" },
      {
        $lookup: {
          from: "Auth",
          localField: "followeeId.authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },

      {
        $addFields: {
          _id: "$followeeId._id",
          username: "$authId.username",
          avatarColor: "$authId.avatarColor",
          uId: "$authId.uId",
          postCount: "$followeeId.postsCount",
          followersCount: "$followeeId.followersCount",
          followingCount: "$followeeId.followingCount",
          profilePicture: "$followeeId.profilePicture",
          userProfile: "$followeeId",
        },
      },
      {
        $project: {
          //excluding below fields since we created required data via addFields
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
        },
      },
    ]);
    return followee;
  }

  //for a user get all users who are following him
  async getFollowerData(userObjectId) {
    const follower = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      {
        $lookup: {
          from: "User",
          localField: "followerId",
          foreignField: "_id",
          as: "followerId",
        },
      },
      { $unwind: "$followerId" },
      {
        $lookup: {
          from: "Auth",
          localField: "followerId.authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      {
        $addFields: {
          _id: "$followerId._id",
          username: "$authId.username",
          avatarColor: "$authId.avatarColor",
          uId: "$authId.uId",
          postCount: "$followerId.postsCount",
          followersCount: "$followerId.followersCount",
          followingCount: "$followerId.followingCount",
          profilePicture: "$followerId.profilePicture",
          userProfile: "$followerId",
        },
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
        },
      },
    ]);
    return follower;
  }
} //eoc

const followerService = new FollowerService();
module.exports = followerService;