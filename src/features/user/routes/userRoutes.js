const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Update = require("../controllers/change-password");
const Get = require("../controllers/get-profile");
const Search = require("../controllers/search-user");
const { changePasswordSchema } = require("../schemes/info");
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

    this.router.get(
      "/user/profile/posts/:username/:userId/:uId",
      authMiddleware.checkAuthentication,
      Get.prototype.profileAndPosts
    );

    this.router.get(
      "/user/profile/user/suggestions",
      authMiddleware.checkAuthentication,
      Get.prototype.randomUserSuggestions
    );

    this.router.get(
      "/user/profile/search/:query",
      authMiddleware.checkAuthentication,
      Search.prototype.user
    );

    this.router.put(
      "/user/profile/change-password",
      validator.body(changePasswordSchema),
      authMiddleware.checkAuthentication,
      Update.prototype.password
    );

    return this.router;
  }
}
const userRoutes = new UserRoutes();
module.exports = userRoutes;
