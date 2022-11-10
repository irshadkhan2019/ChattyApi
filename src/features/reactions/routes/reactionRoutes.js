const express = require("express");
const validator = require("express-joi-validation").createValidator({});
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-reactions");
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
    this.router.post(
      "/post/reaction",
      validator.body(addReactionSchema),
      authMiddleware.checkAuthentication,
      Add.prototype.reaction
    );
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
