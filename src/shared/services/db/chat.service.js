const MessageModel = require("../../../features/chat/models/chat.schema");
const ConversationModel = require("../../../features/chat/models/conversation.schema");

class ChatService {
  async addMessageToDB(data) {
    const conversation = await ConversationModel.find({
      _id: data?.conversationId,
    });

    if (conversation.length === 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      receiverId: data.receiverId,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      senderUsername: data.senderUsername,
      senderId: data.senderId,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      body: data.body,
      isRead: data.isRead,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt,
    });
  }

  async getUserConversationList(userId) {
    const messages = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      {
        $group: {
          _id: "$conversationId",
          //get last message
          result: { $last: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: "$result._id",
          conversationId: "$result.conversationId",
          receiverId: "$result.receiverId",
          receiverUsername: "$result.receiverUsername",
          receiverAvatarColor: "$result.receiverAvatarColor",
          receiverProfilePicture: "$result.receiverProfilePicture",
          senderUsername: "$result.senderUsername",
          senderId: "$result.senderId",
          senderAvatarColor: "$result.senderAvatarColor",
          senderProfilePicture: "$result.senderProfilePicture",
          body: "$result.body",
          isRead: "$result.isRead",
          gifUrl: "$result.gifUrl",
          selectedImage: "$result.selectedImage",
          reaction: "$result.reaction",
          createdAt: "$result.createdAt",
        },
      },
      { $sort: { createdAt: 1 } },
    ]);
    return messages;
  }

  async getMessages(senderId, receiverId, sort) {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };
    const messages = await MessageModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return messages;
  }

  async markMessageAsDeleted(messageId, type) {
    if (type === "deleteForMe") {
      await MessageModel.updateOne(
        { _id: messageId },
        { $set: { deleteForMe: true } }
      );
    } else {
      await MessageModel.updateOne(
        { _id: messageId },
        { $set: { deleteForMe: true, deleteForEveryone: true } }
      );
    }
  }

  async markMessagesAsRead(senderId, receiverId) {
    const query = {
      $or: [
        { senderId, receiverId, isRead: false },
        { senderId: receiverId, receiverId: senderId, isRead: false },
      ],
    };
    await MessageModel.updateMany(query, { $set: { isRead: true } });
  }

  async updateMessageReaction(messageId, senderName, reaction, type) {
    //type=>add/remove

    if (type === "add") {
      await MessageModel.updateOne(
        { _id: messageId },
        { $push: { reaction: { senderName, type: reaction } } }
      );
    } else {
      await MessageModel.updateOne(
        { _id: messageId },
        { $pull: { reaction: { senderName } } }
      );
    }
  }
} //EOC

const chatService = new ChatService();
module.exports = chatService;
