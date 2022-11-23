const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Get = require("../controllers/get-profile");
const validator = require("express-joi-validation").createValidator({});

class UserRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.get(
      "/user/all/:page",
      authMiddleware.checkAuthentication,
      Get.prototype.all
    );

    this.router.get(
      "/user/profile",
      authMiddleware.checkAuthentication,
      Get.prototype.profile
    );

    this.router.get(
      "/user/profile/:userId",
      authMiddleware.checkAuthentication,
      Get.prototype.profileByUserId
    );

    return this.router;
  }
}
const userRoutes = new UserRoutes();
module.exports = userRoutes;
