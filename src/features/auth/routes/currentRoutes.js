const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const CurrentUser = require("../controllers/current-user");

const validator = require("express-joi-validation").createValidator({});

class CurrentRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.get(
      "/currentuser",
      authMiddleware.checkAuthentication,
      CurrentUser.prototype.read
    );

    return this.router;
  }
}
const currentUserRoutes = new CurrentRoutes();
module.exports = currentUserRoutes;
