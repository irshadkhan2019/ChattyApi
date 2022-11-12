const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/follower-user");
const Remove = require("../controllers/unfollow-user");

class FollowerRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    //follow a user
    this.router.put(
      "/user/follow/:followerId",
      authMiddleware.checkAuthentication,
      Add.prototype.follower
    );

    //unfollow a user
    this.router.put(
      "/user/unfollow/:followeeId/:followerId",
      authMiddleware.checkAuthentication,
      Remove.prototype.follower
    );

    return this.router;
  }
}

const followerRoutes = new FollowerRoutes();
module.exports = followerRoutes;
