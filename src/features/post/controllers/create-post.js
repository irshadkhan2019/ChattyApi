const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const imageQueue = require("../../../shared/services/queues/image.queue");
const postQueue = require("../../../shared/services/queues/post.queue");
const PostCache = require("../../../shared/services/redis/post.cache");
const { socketIOPostObject } = require("../../../shared/sockets/post");
const ObjectId = require("mongodb").ObjectId;
const {
  uploads,
} = require("./../../../shared/globals/helpers/cloudinary-upload");
const postCache = new PostCache();

//class
class Create {
  async post(req, res) {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } =
      req.body;
    const postObjectId = new ObjectId();
    const createdPost = {
      _id: postObjectId,
      userId: req.currentUser?.userId,
      username: req.currentUser?.username,
      email: req.currentUser?.email,
      avatarColor: req.currentUser?.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: "",
      imgId: "",
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    };

    //emit event of the created post
    console.log("socketObjcheck", socketIOPostObject);
    // socketIOPostObject.emit("add post", createdPost); //client will listen for this event

    //save post in cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser.userId}`,
      uId: `${req.currentUser.uId}`,
      createdPost,
    });

    //save post in db via queues and workers
    postQueue.addPostJob("addPostToDB", {
      key: req.currentUser?.userId,
      value: createdPost,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Post Created Successfully" });
  } //EOF

  async postWithImage(req, res) {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } =
      req.body;
    const postObjectId = new ObjectId();

    const result = await uploads(image);
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }

    const createdPost = {
      _id: postObjectId,
      userId: req.currentUser?.userId,
      username: req.currentUser?.username,
      email: req.currentUser?.email,
      avatarColor: req.currentUser?.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    };

    //emit event of the created post
    // socketIOPostObject.emit("add post", createdPost); //client will listen for this event

    //save post in cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser.userId}`,
      uId: `${req.currentUser.uId}`,
      createdPost,
    });

    //save post in db via queues and workers
    postQueue.addPostJob("addPostToDB", {
      key: req.currentUser?.userId,
      value: createdPost,
    });

    //call image queue to add POST image to mongodb db
    imageQueue.addImageJob("addImageToDB", {
      userId: `${req.currentUser?.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
    });

    //send res
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Post Created  with Image Successfully" });
  } //EOF
} //EOC

module.exports = Create;
