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

  async markMessagesAsReadInDB(job, done) {
    try {
      const { senderId, receiverId } = job.data;
      chatService.markMessagesAsRead(senderId, receiverId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async updateMessageReaction(job, done) {
    try {
      const { messageId, senderName, reaction, type } = job.data;
      chatService.updateMessageReaction(messageId, senderName, reaction, type);
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
