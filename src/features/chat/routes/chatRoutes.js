const express = require("express");
const joiValidation = require("../../../shared/globals/joi-validation/joi-validation");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-chat-message");
const { addChatSchema } = require("../schemes/chat");
const Get = require("../controllers/get-chat-messages");
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

    return this.router;
  }
}

const chatRoutes = new ChatRoutes();
module.exports = chatRoutes;
