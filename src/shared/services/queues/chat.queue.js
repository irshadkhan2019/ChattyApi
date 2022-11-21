const chatWorker = require("../../workers/chat.worker");
const { BaseQueue } = require("./base.queue");

class ChatQueue extends BaseQueue {
  constructor() {
    super("chats");
    this.processJob("addChatMessageToDB", 5, chatWorker.addChatMessageToDB);
    this.processJob(
      "markMessageAsDeletedInDB",
      5,
      chatWorker.markMessageAsDeleted
    );
    this.processJob(
      "markMessagesAsReadInDB",
      5,
      chatWorker.markMessagesAsReadInDB
    );
  }

  addChatJob(name, data) {
    this.addJob(name, data);
  }
}
const chatQueue = new ChatQueue();
module.exports = chatQueue;
