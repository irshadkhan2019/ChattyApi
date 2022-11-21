const express = require("express");
const joiValidation = require("../../../shared/globals/joi-validation/joi-validation");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-chat-message");
const { addChatSchema, markChatSchema } = require("../schemes/chat");
const Get = require("../controllers/get-chat-messages");
const Delete = require("../controllers/delete-chat-message");
const Update = require("../controllers/update-chat-message");
const Message = require("../controllers/add-message-reaction");
const validator = require("express-joi-validation").createValidator({});

class ChatRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.get(
      "/chat/message/conversation-list",
      authMiddleware.checkAuthentication,
      Get.prototype.conversationList
    );
    this.router.get(
      "/chat/message/user/:receiverId",
      authMiddleware.checkAuthentication,
      Get.prototype.messages
    );
    this.router.post(
      "/chat/message",
      validator.body(addChatSchema),
      authMiddleware.checkAuthentication,

      Add.prototype.message
    );

    this.router.post(
      "/chat/message/add-chat-users",
      authMiddleware.checkAuthentication,
      Add.prototype.addChatUsers
    );

    this.router.post(
      "/chat/message/remove-chat-users",
      authMiddleware.checkAuthentication,
      Add.prototype.removeChatUsers
    );

    this.router.put(
      "/chat/message/mark-as-read",
      validator.body(markChatSchema),
      authMiddleware.checkAuthentication,
      Update.prototype.message
    );
    //add reaction to msg
    this.router.put(
      "/chat/message/reaction",
      authMiddleware.checkAuthentication,
      Message.prototype.reaction
    );

    this.router.delete(
      "/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type",
      authMiddleware.checkAuthentication,
      Delete.prototype.markMessageAsDeleted
    );

    return this.router;
  }
}

const chatRoutes = new ChatRoutes();
module.exports = chatRoutes;
