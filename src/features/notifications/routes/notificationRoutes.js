const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Delete = require("../controllers/delete-notification");
const Get = require("../controllers/get-notifications");
const Update = require("../controllers/update-notification");

class NotificationRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.get(
      "/notifications",
      authMiddleware.checkAuthentication,
      Get.prototype.notifications
    );

    this.router.put(
      "/notification/:notificationId",
      authMiddleware.checkAuthentication,
      Update.prototype.notification
    );
    this.router.delete(
      "/notification/:notificationId",
      authMiddleware.checkAuthentication,
      Delete.prototype.notification
    );

    return this.router;
  }
}

const notificationRoutes = new NotificationRoutes();
module.exports = notificationRoutes;
