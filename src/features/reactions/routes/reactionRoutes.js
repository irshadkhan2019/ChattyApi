const express = require("express");
const validator = require("express-joi-validation").createValidator({});
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-reactions");
const Get = require("../controllers/get-reactions");
const Remove = require("../controllers/remove-reaction");
const {
  addReactionSchema,
  removeReactionSchema,
} = require("../schemes/reactions");

class ReactionRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    //get all reactions for a post
    this.router.get(
      "/post/reactions/:postId",
      authMiddleware.checkAuthentication,
      Get.prototype.reactions
    );
    //get a reaction of a post given a username
    this.router.get(
      "/post/single/reaction/username/:username/:postId",
      authMiddleware.checkAuthentication,
      Get.prototype.singleReactionByUsername
    );
    //get all reactions for a username
    this.router.get(
      "/post/reactions/username/:username",
      authMiddleware.checkAuthentication,
      Get.prototype.reactionsByUsername
    );

    //store reaction
    this.router.post(
      "/post/reaction",
      validator.body(addReactionSchema),
      authMiddleware.checkAuthentication,
      Add.prototype.reaction
    );
    //delete reaction
    this.router.delete(
      "/post/reaction/:postId/:previousReaction/:postReactions",
      // validator.params(removeReactionSchema),
      authMiddleware.checkAuthentication,
      Remove.prototype.reaction
    );

    return this.router;
  }
}

const reactionRoutes = new ReactionRoutes();
module.exports = reactionRoutes;
