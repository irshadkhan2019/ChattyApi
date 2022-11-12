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
} //eoc

const followerService = new FollowerService();
module.exports = followerService;
