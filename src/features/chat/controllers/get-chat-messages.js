const { StatusCodes } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const chatService = require("../../../shared/services/db/chat.service");
const MessageCache = require("../../../shared/services/redis/message.cache");

const messageCache = new MessageCache();

class Get {
  async conversationList(req, res) {
    let list = [];
    const cachedList = await messageCache.getUserConversationList(
      `${req.currentUser?.userId}`
    );
    if (cachedList.length) {
      list = cachedList;
    } else {
      list = await chatService.getUserConversationList(
        new mongoose.Types.ObjectId(req.currentUser?.userId)
      );
    }

    res
      .status(StatusCodes.OK)
      .json({ message: "User conversation list", list });
  }

  //get all messages for a given user
  async messages(req, res) {
    const { receiverId } = req.params;

    let messages = [];
    const cachedMessages = await messageCache.getChatMessagesFromCache(
      `${req.currentUser?.userId}`,
      `${receiverId}`
    );
    if (cachedMessages.length) {
      messages = cachedMessages;
    } else {
      messages = await chatService.getMessages(
        new mongoose.Types.ObjectId(req.currentUser?.userId),
        new mongoose.Types.ObjectId(receiverId),
        { createdAt: 1 }
      );
    }

    res
      .status(StatusCodes.OK)
      .json({ message: "User chat messages", messages });
  }
}

module.exports = Get;
