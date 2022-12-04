const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const {
  uploads,
  videoUpload,
} = require("../../../shared/globals/helpers/cloudinary-upload");
const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const imageQueue = require("../../../shared/services/queues/image.queue");
const postQueue = require("../../../shared/services/queues/post.queue");
const PostCache = require("../../../shared/services/redis/post.cache");

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
      videoId,
      videoVersion,
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
      videoId: "",
      videoVersion: "",
    };

    //update in cache
    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);

    const socketIOPostObject = getSocketServerInstance();
    socketIOPostObject.emit("update post", postUpdated);

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
      const result = await Update.prototype.addFileToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Post with image updated successfully" });
  }

  async postWithVideo(req, res) {
    const { videoId, videoVersion } = req.body;

    if (videoId && videoVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result = await Update.prototype.addFileToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Post with video updated successfully" });
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
      videoId,
      videoVersion,
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
      videoId: videoId ? videoId : "",
      videoVersion: videoVersion ? videoVersion : "",
    };

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);

    const socketIOPostObject = getSocketServerInstance();
    socketIOPostObject.emit("update post", postUpdated);

    postQueue.addPostJob("updatePostInDB", {
      postId: postId,
      // updatedPost: postUpdated,
      updatedPost,
    });
  } //eof

  async addFileToExistingPost(req) {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      profilePicture,
      image,
      video,
    } = req.body;

    const { postId } = req.params;

    //upload video or image at cloudinary
    const result = image ? await uploads(image) : await videoUpload(video);

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
      videoId: video ? result.public_id : "",
      videoVersion: video ? result.version.toString() : "",
    };

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);

    const socketIOPostObject = getSocketServerInstance();
    socketIOPostObject.emit("update post", postUpdated);
    postQueue.addPostJob("updatePostInDB", {
      postId: postId,
      // updatedPost: postUpdated,
      updatedPost,
    });

    //call image queue to add POST image to mongodb db
    if (image) {
      imageQueue.addImageJob("addImageToDB", {
        userId: `${req.currentUser?.userId}`,
        imgId: result.public_id,
        imgVersion: result.version.toString(),
      });
    }

    return result;
  }
} //eoc

module.exports = Update;
