const chatService = require("../services/db/chat.service");

class ChatWorker {
  async addChatMessageToDB(job, done) {
    try {
      chatService.addMessageToDB(job.data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
  async markMessageAsDeleted(job, done) {
    try {
      const { messageId, type } = job.data;
      chatService.markMessageAsDeleted(messageId, type);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}

const chatWorker = new ChatWorker();
module.exports = chatWorker;
