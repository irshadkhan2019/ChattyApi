const { findIndex } = require("lodash");
const { ServerError } = require("../../globals/helpers/error-handler");
const BaseCache = require("./base.cache");

class MessageCache extends BaseCache {
  constructor() {
    super("messageCache");
  }

  async addChatListToCache(senderId, receiverId, conversationId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userChatList = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );

      //if no one in chat list
      if (userChatList.length === 0) {
        await this.client.RPUSH(
          `chatList:${senderId}`,
          JSON.stringify({ receiverId, conversationId })
        );
      } else {
        //check if reciever is already in chatList or not
        const receiverIndex = findIndex(userChatList, (listItem) =>
          listItem.includes(receiverId)
        );

        //if receiver not in chatList
        if (receiverIndex < 0) {
          await this.client.RPUSH(
            `chatList:${senderId}`,
            JSON.stringify({ receiverId, conversationId })
          );
        }
      }
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }
}
module.exports = MessageCache;
