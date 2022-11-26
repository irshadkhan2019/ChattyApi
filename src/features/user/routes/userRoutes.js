const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Update = require("../controllers/change-password");
const Get = require("../controllers/get-profile");
const Search = require("../controllers/search-user");
const Edit = require("../controllers/update-basic-info");
const UpdateSettings = require("../controllers/update-settings");
const {
  changePasswordSchema,
  basicInfoSchema,
  socialLinksSchema,
  notificationSettingsSchema,
} = require("../schemes/info");
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

    //updating users infos
    this.router.put(
      "/user/profile/basic-info",
      validator.body(basicInfoSchema),
      authMiddleware.checkAuthentication,
      Edit.prototype.info
    );
    this.router.put(
      "/user/profile/social-links",
      validator.body(socialLinksSchema),
      authMiddleware.checkAuthentication,
      Edit.prototype.social
    );

    //updating user Notification setting
    this.router.put(
      "/user/profile/settings",
      validator.body(notificationSettingsSchema),
      authMiddleware.checkAuthentication,
      UpdateSettings.prototype.notification
    );

    return this.router;
  }
}
const userRoutes = new UserRoutes();
module.exports = userRoutes;
