const { default: mongoose } = require("mongoose");
const NotificationModel = require("../../../features/notifications/models/notification.schema");
const UserModel = require("../../../features/user/models/user.schema");
class NotificationService {
  //gives all notifications for the given userId
  async getNotifications(userId) {
    console.log("getting notification for user", userId);
    const notifications = await NotificationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "userFrom",
          foreignField: "_id",
          as: "userFrom",
        },
      },
      { $unwind: "$userFrom" },
      {
        $lookup: {
          from: "auths",
          localField: "userFrom.authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          notificationType: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: "$userFrom.profilePicture",
            username: "$authId.username",
            avatarColor: "$authId.avatarColor",
            uId: "$authId.uId",
          },
        },
      },
    ]);
    return notifications;
  }

  async updateNotification(notificationId) {
    await NotificationModel.updateOne(
      { _id: notificationId },
      { $set: { read: true } }
    );
  }

  async deleteNotification(notificationId) {
    await NotificationModel.deleteOne({ _id: notificationId });
  }
}

const notificationService = new NotificationService();
module.exports = notificationService;
