const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-image");
const Delete = require("../controllers/delete-image");
const Get = require("../controllers/get-images");
const addImageSchema = require("../schemes/images");
const validator = require("express-joi-validation").createValidator({});

class ImageRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    //get All images for uId
    this.router.get(
      "/images/:userId",
      authMiddleware.checkAuthentication,
      Get.prototype.images
    );
    //upload user profile image
    this.router.post(
      "/images/profile",
      validator.body(addImageSchema),
      authMiddleware.checkAuthentication,

      Add.prototype.profileImage
    );

    //upload user bg image
    this.router.post(
      "/images/background",
      validator.body(addImageSchema),
      authMiddleware.checkAuthentication,
      Add.prototype.backgroundImage
    );

    //delete image
    this.router.delete(
      "/images/:imageId",
      authMiddleware.checkAuthentication,
      Delete.prototype.image
    );

    //delete bg image
    this.router.delete(
      "/images/background/:bgImageId",
      authMiddleware.checkAuthentication,
      Delete.prototype.backgroundImage
    );

    return this.router;
  }
}

const imageRoutes = new ImageRoutes();
module.exports = imageRoutes;
