const { StatusCodes } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const { getSocketServerInstance } = require("../../../ioServerStore");
const chatQueue = require("../../../shared/services/queues/chat.queue");
const MessageCache = require("../../../shared/services/redis/message.cache");

const messageCache = new MessageCache();

class Update {
  async message(req, res) {
    const { senderId, receiverId } = req.body;
    const updatedMessage = await messageCache.updateChatMessages(
      `${senderId}`,
      `${receiverId}`
    );
    const socketIOChatObject = getSocketServerInstance();
    socketIOChatObject.emit("message read", updatedMessage);
    socketIOChatObject.emit("chat list", updatedMessage);

    chatQueue.addChatJob("markMessagesAsReadInDB", {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
    });
    res.status(StatusCodes.OK).json({ message: "Message marked as read" });
  }
}

module.exports = Update;
