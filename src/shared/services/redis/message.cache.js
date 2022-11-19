const { findIndex } = require("lodash");
const { ServerError } = require("../../globals/helpers/error-handler");
const Helpers = require("../../globals/helpers/helpers");
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

  async addChatMessageToCache(conversationId, value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(
        `messages:${conversationId}`,
        JSON.stringify(value)
      );
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async addChatUsersToCache(value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users = await this.getChatUsersList();
      const usersIndex = findIndex(
        users,
        (listItem) => JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers = [];

      //if users not in list
      if (usersIndex === -1) {
        await this.client.RPUSH("chatUsers", JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        //if users already in list
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async removeChatUsersFromCache(value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users = await this.getChatUsersList();
      const usersIndex = findIndex(
        users,
        (listItem) => JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers = [];
      //if users in list then remove
      if (usersIndex > -1) {
        await this.client.LREM("chatUsers", usersIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        //not in list
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async getChatUsersList() {
    const chatUsersList = [];
    const chatUsers = await this.client.LRANGE("chatUsers", 0, -1);
    for (const item of chatUsers) {
      const chatUser = Helpers.parseJson(item);
      chatUsersList.push(chatUser);
    }
    return chatUsersList;
  }
} //eoc
module.exports = MessageCache;
