const { default: mongoose } = require("mongoose");
const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const UserCache = require("../../../shared/services/redis/user.cache");
const ObjectId = require("mongodb").ObjectId;
const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const notificationTemplate = require("../../../shared/services/emails/templates/notifications/notification-template");
const emailQueue = require("../../../shared/services/queues/email.queue");
const MessageCache = require("../../../shared/services/redis/message.cache");
const userCache = new UserCache();
const messageCache = new MessageCache();

class Add {
  async message(req, res) {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage,
    } = req.body;

    let fileUrl = ""; //for image

    const messageObjectId = new ObjectId(); //same for cache and db
    const conversationObjectId = !conversationId
      ? new ObjectId()
      : new mongoose.Types.ObjectId(conversationId);

    const sender = await userCache.getUserFromCache(
      `${req.currentUser?.userId}`
    );

    //if sender sends image in chat
    if (selectedImage.length) {
      const result = await uploads(
        req.body.image,
        req.currentUser?.userId,
        true,
        true
      );
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      fileUrl = `https://res.cloudinary.com/dnslnpn4l/image/upload/v${result.version}/${result.public_id}`;
    }

    //create chat msg data
    const messageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverAvatarColor,
      receiverProfilePicture,
      receiverUsername,
      senderUsername: `${req.currentUser?.username}`,
      senderId: `${req.currentUser?.userId}`,
      senderAvatarColor: `${req.currentUser?.avatarColor}`,
      senderProfilePicture: `${sender.profilePicture}`,
      body,
      isRead,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForEveryone: false,
      deleteForMe: false,
    };

    //send IO events of messages and chat list to online users
    Add.prototype.emitSocketIOEvent(messageData);

    //if receiver was not online send him email notification
    if (!isRead) {
      Add.prototype.messageNotification({
        currentUser: req.currentUser,
        message: body,
        receiverName: receiverUsername,
        receiverId,
        messageData,
      });
    }

    //add receiver in senders chatList
    await messageCache.addChatListToCache(
      `${req.currentUser?.userId}`,
      `${receiverId}`,
      `${conversationObjectId}`
    );

    //add sender in receivers chatList
    await messageCache.addChatListToCache(
      `${receiverId}`,
      `${req.currentUser?.userId}`,
      `${conversationObjectId}`
    );

    await messageCache.addChatMessageToCache(
      `${conversationObjectId}`,
      messageData
    );

    res
      .status(StatusCodes.OK)
      .json({ message: "Message added", conversationId: conversationObjectId });
  }

  //to check if a user is on chatList page or not at client side
  async addChatUsers(req, res) {
    const chatUsers = await messageCache.addChatUsersToCache(req.body);
    const socketIOChatObject = getSocketServerInstance();
    socketIOChatObject.emit("add chat users", chatUsers);
    res.status(StatusCodes.OK).json({ message: "Users added" });
  }

  async removeChatUsers(req, res) {
    const chatUsers = await messageCache.removeChatUsersFromCache(req.body);
    const socketIOChatObject = getSocketServerInstance();
    socketIOChatObject.emit("add chat users", chatUsers);
    res.status(StatusCodes.OK).json({ message: "Users removed" });
  }
  emitSocketIOEvent(data) {
    const socketIOChatObject = getSocketServerInstance();
    socketIOChatObject.emit("message received", data);
    socketIOChatObject.emit("chat list", data);
  }

  async messageNotification({
    currentUser,
    message,
    receiverName,
    receiverId,
  }) {
    const cachedUser = await userCache.getUserFromCache(`${receiverId}`);

    //if receiver has enabled messages in settings
    if (cachedUser.notifications.messages) {
      const templateParams = {
        username: receiverName,
        message,
        header: `Message notification from ${currentUser.username}`,
      };

      const template =
        notificationTemplate.notificationMessageTemplate(templateParams);

      emailQueue.addEmailJob("directMessageEmail", {
        receiverEmail: cachedUser.email,
        template,
        subject: `You've received messages from ${currentUser.username}`,
      });
    }
  }
}
module.exports = Add;
