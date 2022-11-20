const chatWorker = require("../../workers/chat.worker");
const { BaseQueue } = require("./base.queue");

class ChatQueue extends BaseQueue {
  constructor() {
    super("chats");
    this.processJob("addChatMessageToDB", 5, chatWorker.addChatMessageToDB);
  }

  addChatJob(name, data) {
    this.addJob(name, data);
  }
}
const chatQueue = new ChatQueue();
module.exports = chatQueue;
