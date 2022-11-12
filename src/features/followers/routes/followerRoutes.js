const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/follower-user");
const Get = require("../controllers/get-followers");
const Remove = require("../controllers/unfollow-user");

class FollowerRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    //get all users followed by loggedin user
    this.router.get(
      "/user/following",
      authMiddleware.checkAuthentication,
      Get.prototype.userFollowing
    );

    //get all users following a user with mentioned ID
    this.router.get(
      "/user/followers/:userId",
      authMiddleware.checkAuthentication,
      Get.prototype.userFollowers
    );
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
