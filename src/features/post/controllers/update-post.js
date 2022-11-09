const { StatusCodes } = require("http-status-codes");
const {
  uploads,
} = require("../../../shared/globals/helpers/cloudinary-upload");
const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const postQueue = require("../../../shared/services/queues/post.queue");
const PostCache = require("../../../shared/services/redis/post.cache");
const { socketIOPostObject } = require("../../../shared/sockets/post");

const postCache = new PostCache();

class Update {
  async post(req, res) {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    } = req.body;

    const { postId } = req.params;
    const updatedPost = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    };

    //update in cache
    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);
    // socketIOPostObject.emit("update post", postUpdated, "posts");

    //update in db
    postQueue.addPostJob("updatePostInDB", {
      postId,
      updatedPost,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "post Updated Successfully", postUpdated });
  }

  async postWithImage(req, res) {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      //already it has image so change previous image
      Update.prototype.updatePost(req);
    } else {
      //upload new image to an post not having image .
      const result = await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Post with image updated successfully" });
  }

  async updatePost(req) {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    } = req.body;

    const { postId } = req.params;

    const updatedPost = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imgId ? imgId : "",
      imgVersion: imgVersion ? imgVersion : "",
    };

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);
    // socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob("updatePostInDB", {
      postId: postId,
      // updatedPost: postUpdated,
      updatedPost,
    });
  } //eof

  async addImageToExistingPost(req) {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } =
      req.body;
    const { postId } = req.params;
    const result = await uploads(image);

    if (!result?.public_id) {
      return result;
    }
    const updatedPost = {
      post,
      bgColor,
      privacy,
      feelings,
      image,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : "",
      imgVersion: image ? result.version.toString() : "",
    };

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);
    // socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob("updatePostInDB", {
      postId: postId,
      // updatedPost: postUpdated,
      updatedPost,
    });

    return result;
  }
} //eoc

module.exports = Update;
