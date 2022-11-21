const { StatusCodes } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const { getSocketServerInstance } = require("../../../ioServerStore");
const chatQueue = require("../../../shared/services/queues/chat.queue");
const MessageCache = require("../../../shared/services/redis/message.cache");

const messageCache = new MessageCache();
class Delete {
  async markMessageAsDeleted(req, res) {
    const { senderId, receiverId, messageId, type } = req.params;
    const updatedMessage = await messageCache.markMessageAsDeleted(
      `${senderId}`,
      `${receiverId}`,
      `${messageId}`,
      type
    );
    const socketIOChatObject = getSocketServerInstance();
    socketIOChatObject.emit("message read", updatedMessage);
    socketIOChatObject.emit("chat list", updatedMessage);
    chatQueue.addChatJob("markMessageAsDeletedInDB", {
      messageId: new mongoose.Types.ObjectId(messageId),
      type,
    });

    res.status(StatusCodes.OK).json({ message: "Message marked as deleted" });
  }
}

module.exports = Delete;
