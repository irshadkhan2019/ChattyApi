const { default: mongoose } = require("mongoose");
const UserModel = require("../../../features/user/models/user.schema");

class BlockUserService {
  async blockUser(userId, followerId) {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: userId,
            blocked: { $ne: new mongoose.Types.ObjectId(followerId) },
          },
          update: {
            $push: { blocked: new mongoose.Types.ObjectId(followerId) },
          },
        },
      },

      {
        updateOne: {
          filter: {
            _id: followerId,
            blockedBy: { $ne: new mongoose.Types.ObjectId(userId) },
          },
          update: {
            $push: { blockedBy: new mongoose.Types.ObjectId(userId) },
          },
        },
      },
    ]);
  }

  async unblockUser(userId, followerId) {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId),
            },
          },
        },
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(userId),
            },
          },
        },
      },
    ]);
  }
} //eoc

const blockUserService = new BlockUserService();

module.exports = blockUserService;
