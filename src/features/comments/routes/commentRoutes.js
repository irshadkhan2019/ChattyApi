const express = require("express");
const authMiddleware = require("../../../shared/globals/helpers/auth-middleware");
const Add = require("../controllers/add-comment");
const Get = require("../controllers/get-comments");
const addCommentSchema = require("../schemes/comment");
const validator = require("express-joi-validation").createValidator({});

class CommentRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    //get all comments from a post
    this.router.get(
      "/post/comments/:postId",
      authMiddleware.checkAuthentication,

      Get.prototype.comments
    );
    //get comment names of all user of a specific post
    this.router.get(
      "/post/commentsnames/:postId",
      authMiddleware.checkAuthentication,
      Get.prototype.commentsNamesFromCache
    );
    //get a comment of a post
    this.router.get(
      "/post/single/comment/:postId/:commentId",
      authMiddleware.checkAuthentication,
      Get.prototype.singleComment
    );

    //add comment ot a post
    this.router.post(
      "/post/comment",
      validator.body(addCommentSchema),
      authMiddleware.checkAuthentication,
      Add.prototype.comment
    );

    return this.router;
  }
}

const commentRoutes = new CommentRoutes();
module.exports = commentRoutes;
