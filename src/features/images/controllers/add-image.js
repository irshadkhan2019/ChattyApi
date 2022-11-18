const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const {
  uploads,
} = require("../../../shared/globals/helpers/cloudinary-upload");
const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const Helpers = require("../../../shared/globals/helpers/helpers");
const imageQueue = require("../../../shared/services/queues/image.queue");
const UserCache = require("../../../shared/services/redis/user.cache");

const userCache = new UserCache();
class Add {
  //upload profile image
  async profileImage(req, res) {
    const result = await uploads(
      req.body.image,
      req.currentUser?.userId,
      true,
      true
    );
    console.log(result.message);

    if (!result?.public_id) {
      throw new BadRequestError("File upload Failed");
    }

    const url = `https://res.cloudinary.com/dnslnpn4l/image/upload/v${result.version}/${result.public_id}`;

    //update profilePicture in userCache
    const cachedUser = await userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "profilePicture",
      url
    );

    const socketIOImageObject = getSocketServerInstance();
    socketIOImageObject.emit("update user", cachedUser);

    //update profilePicture in Db
    imageQueue.addImageJob("addUserProfileImageToDB", {
      userId: `${req.currentUser?.userId}`,
      url,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
    });

    res.status(StatusCodes.OK).json({ message: "Image Added Successfully" });
  } //eof

  //upload background image
  async backgroundImage(req, res) {
    const { version, publicId } = await Add.prototype.backgroundUpload(
      req.body.image
    );
    const bgImageId = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "bgImageId",
      publicId
    );
    const bgImageVersion = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "bgImageVersion",
      version
    );
    const response = await Promise.all([bgImageId, bgImageVersion]);

    const socketIOImageObject = getSocketServerInstance();
    socketIOImageObject.emit("update user", {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: response[0],
    });

    console.log("adding job");
    imageQueue.addImageJob("updateBGImageInDB", {
      userId: `${req.currentUser?.userId}`,
      imgId: publicId,
      imgVersion: version.toString(),
    });
    res.status(StatusCodes.OK).json({ message: "Image added successfully" });
  }

  async backgroundUpload(image) {
    const isDataURL = Helpers.isDataURL(image);
    let version = "";
    let publicId = "";
    if (isDataURL) {
      //uploading a new bgimage
      const result = await uploads(image);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.public_id;
      }
    } else {
      //choosing from previously uploaded bgImage
      const value = image.split("/");
      version = value[value.length - 2];
      publicId = value[value.length - 1];
    }
    return { version: version.replace(/v/g, ""), publicId };
  }
} //eoc

module.exports = Add;
