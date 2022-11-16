const { mongoose } = require("mongoose");
// const notificationService = require("../../../shared/services/db/notification.service");
// const notificationService = require("../../../shared/services/db/notification.service");

const notificationSchema = new mongoose.Schema({
  userTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  userFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  read: { type: Boolean, default: false },
  message: { type: String, default: "" },
  notificationType: String,
  entityId: mongoose.Types.ObjectId,
  createdItemId: mongoose.Types.ObjectId,
  comment: { type: String, default: "" },
  reaction: { type: String, default: "" },
  post: { type: String, default: "" },
  imgId: { type: String, default: "" },
  imgVersion: { type: String, default: "" },
  gifUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now() },
});

notificationSchema.methods.insertNotification = async function (body) {
  const {
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    createdAt,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
  } = body;

  const notification = await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    createdAt,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
  });

  try {
    // const notifications = await notificationService.getNotifications(userTo);
    return [notification];
  } catch (error) {
    return error;
  }
};

const NotificationModel = mongoose.model("Notification", notificationSchema);
module.exports = NotificationModel;
