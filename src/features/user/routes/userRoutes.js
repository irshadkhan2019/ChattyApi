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

    return this.router;
  }
}
const userRoutes = new UserRoutes();
module.exports = userRoutes;
