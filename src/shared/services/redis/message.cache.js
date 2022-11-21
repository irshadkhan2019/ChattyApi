const { findIndex, find, filter, remove } = require("lodash");
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

  async getUserConversationList(key) {
    //userId==key
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(`chatList:${key}`, 0, -1);

      const conversationChatList = [];

      //get last msg for each chat users(conversation id) in list .
      for (const item of userChatList) {
        const chatItem = Helpers.parseJson(item);
        const lastMessage = await this.client.LINDEX(
          `messages:${chatItem.conversationId}`,
          -1
        );
        conversationChatList.push(Helpers.parseJson(lastMessage));
      }
      return conversationChatList;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async getChatMessagesFromCache(senderId, receiverId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      const receiver = find(userChatList, (listItem) =>
        listItem.includes(receiverId)
      );
      const parsedReceiver = Helpers.parseJson(receiver);

      if (parsedReceiver) {
        const userMessages = await this.client.LRANGE(
          `messages:${parsedReceiver.conversationId}`,
          0,
          -1
        );
        const chatMessages = [];
        for (const item of userMessages) {
          const chatItem = Helpers.parseJson(item);
          chatMessages.push(chatItem);
        }
        return chatMessages;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async markMessageAsDeleted(senderId, receiverId, messageId, type) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const { index, message, receiver } = await this.getMessage(
        senderId,
        receiverId,
        messageId
      );
      const chatItem = Helpers.parseJson(message);
      if (type === "deleteForMe") {
        chatItem.deleteForMe = true;
      } else {
        chatItem.deleteForMe = true;
        chatItem.deleteForEveryone = true;
      }
      //to update use LSET and  provide index
      await this.client.LSET(
        `messages:${receiver.conversationId}`,
        index,
        JSON.stringify(chatItem)
      );

      //fetch via index LINDEX
      const lastMessage = await this.client.LINDEX(
        `messages:${receiver.conversationId}`,
        index
      );
      return Helpers.parseJson(lastMessage);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async getMessage(senderId, receiverId, messageId) {
    const userChatList = await this.client.LRANGE(
      `chatList:${senderId}`,
      0,
      -1
    );
    const receiver = find(userChatList, (listItem) =>
      listItem.includes(receiverId)
    );
    const parsedReceiver = Helpers.parseJson(receiver);
    const messages = await this.client.LRANGE(
      `messages:${parsedReceiver.conversationId}`,
      0,
      -1
    );
    const message = find(messages, (listItem) => listItem.includes(messageId));
    const index = findIndex(messages, (listItem) =>
      listItem.includes(messageId)
    );

    return { index, message, receiver: parsedReceiver };
  }

  //mark as read
  async updateChatMessages(senderId, receiverId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      const receiver = find(userChatList, (listItem) =>
        listItem.includes(receiverId)
      );
      const parsedReceiver = Helpers.parseJson(receiver);
      const messages = await this.client.LRANGE(
        `messages:${parsedReceiver.conversationId}`,
        0,
        -1
      );

      const unreadMessages = filter(
        messages,
        (listItem) => !Helpers.parseJson(listItem).isRead
      );

      //mark all unread msg as read
      for (const item of unreadMessages) {
        const chatItem = Helpers.parseJson(item);
        const index = findIndex(messages, (listItem) =>
          listItem.includes(`${chatItem._id}`)
        );
        chatItem.isRead = true;
        await this.client.LSET(
          `messages:${chatItem.conversationId}`,
          index,
          JSON.stringify(chatItem)
        );
      }

      const lastMessage = await this.client.LINDEX(
        `messages:${parsedReceiver.conversationId}`,
        -1
      );
      return Helpers.parseJson(lastMessage);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async updateMessageReaction(
    conversationId,
    messageId,
    reaction,
    senderName,
    type // can be 'add' | 'remove'
  ) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const messages = await this.client.LRANGE(
        `messages:${conversationId}`,
        0,
        -1
      );
      const messageIndex = findIndex(messages, (listItem) =>
        listItem.includes(messageId)
      );
      const message = await this.client.LINDEX(
        `messages:${conversationId}`,
        messageIndex
      );

      //convert from string to Json
      const parsedMessage = Helpers.parseJson(message);

      const reactions = [];
      //if  message exists
      if (parsedMessage) {
        //remove previously added reaction for the user who is adding new reaction to a msg
        remove(
          parsedMessage.reaction,
          (reaction) => reaction.senderName === senderName
        );

        if (type === "add") {
          reactions.push({ senderName, type: reaction });
          //add own reaction to reaction list of a msg + retain prev msgs
          parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
          //store updated msg having reaction list updated
          await this.client.LSET(
            `messages:${conversationId}`,
            messageIndex,
            JSON.stringify(parsedMessage)
          );
        } else {
          await this.client.LSET(
            `messages:${conversationId}`,
            messageIndex,
            JSON.stringify(parsedMessage)
          );
        }
      }

      //send updated message with reaction as response
      const updatedMessage = await this.client.LINDEX(
        `messages:${conversationId}`,
        messageIndex
      );
      return Helpers.parseJson(updatedMessage);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }
} //eoc
module.exports = MessageCache;
