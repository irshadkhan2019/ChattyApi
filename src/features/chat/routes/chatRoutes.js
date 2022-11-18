const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-chat-message");
const { addChatSchema } = require("../schemes/chat");
const validator = require("express-joi-validation").createValidator({});

class ChatRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    //get all comments from a post
    this.router.post(
      "/chat/message",
      validator.body(addChatSchema),
      authMiddleware.checkAuthentication,
      Add.prototype.message
    );

    return this.router;
  }
}

const chatRoutes = new ChatRoutes();
module.exports = chatRoutes;
