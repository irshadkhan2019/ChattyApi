const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Create = require("../controllers/create-post");
const Delete = require("../controllers/delete-post");
const Get = require("../controllers/get-post");
const Update = require("../controllers/update-post");
const {
  postSchema,
  postWithImageSchema,
  postWithVideoSchema,
} = require("../schemes/post.schemes");

const validator = require("express-joi-validation").createValidator({});

class PostRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.post(
      "/post",
      validator.body(postSchema),
      authMiddleware.checkAuthentication,
      Create.prototype.post
    );
    //send posts with images
    this.router.post(
      "/post/image/post",
      validator.body(postWithImageSchema),
      authMiddleware.checkAuthentication,
      Create.prototype.postWithImage
    );

    //send posts with video
    this.router.post(
      "/post/video/post",
      validator.body(postWithVideoSchema),
      authMiddleware.checkAuthentication,
      Create.prototype.postWithVideo
    );

    //get all posts
    this.router.get(
      "/post/all/:page",
      authMiddleware.checkAuthentication,
      Get.prototype.posts
    );

    //get posts with images
    this.router.get(
      "/post/images/:page",
      authMiddleware.checkAuthentication,
      Get.prototype.postsWithImages
    );

    //delete post given postId
    this.router.delete(
      "/post/:postId",
      authMiddleware.checkAuthentication,
      Delete.prototype.post
    );

    //update post given id
    this.router.put(
      "/post/:postId",
      validator.body(postSchema),
      authMiddleware.checkAuthentication,
      Update.prototype.post
    );

    //update post with image given id
    this.router.put(
      "/post/image/:postId",
      validator.body(postWithImageSchema),
      authMiddleware.checkAuthentication,
      Update.prototype.postWithImage
    );

    //update post with video given id
    this.router.put(
      "/post/video/:postId",
      validator.body(postWithVideoSchema),
      authMiddleware.checkAuthentication,
      Update.prototype.postWithVideo
    );
    return this.router;
  }
}
const postRoutes = new PostRoutes();
module.exports = postRoutes;
