const { StatusCodes } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const { getSocketServerInstance } = require("../../../ioServerStore");
const chatQueue = require("../../../shared/services/queues/chat.queue");
const MessageCache = require("../../../shared/services/redis/message.cache");

const messageCache = new MessageCache();

class Message {
  async reaction(req, res) {
    const { conversationId, messageId, reaction, type } = req.body;
    const updatedMessage = await messageCache.updateMessageReaction(
      `${conversationId}`,
      `${messageId}`,
      `${reaction}`,
      `${req.currentUser?.username}`,
      type
    );
    const socketIOChatObject = getSocketServerInstance();
    socketIOChatObject.emit("message reaction", updatedMessage);

    chatQueue.addChatJob("updateMessageReaction", {
      messageId: new mongoose.Types.ObjectId(messageId),
      senderName: req.currentUser?.username,
      reaction,
      type,
    });
    res.status(StatusCodes.OK).json({ message: "Message reaction added" });
  }
}
module.exports = Message;
