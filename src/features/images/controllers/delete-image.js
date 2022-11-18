const { StatusCodes } = require("http-status-codes");
const { getSocketServerInstance } = require("../../../ioServerStore");
const imageService = require("../../../shared/services/db/image.service");
const imageQueue = require("../../../shared/services/queues/image.queue");
const UserCache = require("../../../shared/services/redis/user.cache");

const userCache = new UserCache();

class Delete {
  async image(req, res) {
    const { imageId } = req.params;

    const socketIOImageObject = getSocketServerInstance();
    socketIOImageObject.emit("delete image", imageId);

    imageQueue.addImageJob("removeImageFromDB", {
      imageId,
    });
    res.status(StatusCodes.OK).json({ message: "Image deleted successfully" });
  }

  async backgroundImage(req, res) {
    const image = await imageService.getImageByBackgroundId(
      req.params.bgImageId
    );
    console.log(image);

    const socketIOImageObject = getSocketServerInstance();
    socketIOImageObject.emit("delete image", image?._id);

    const bgImageId = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "bgImageId",
      ""
    );
    const bgImageVersion = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      "bgImageVersion",
      ""
    );

    await Promise.all([bgImageId, bgImageVersion]);

    imageQueue.addImageJob("removeImageFromDB", {
      imageId: image?._id,
    });

    res.status(StatusCodes.OK).json({ message: "Image deleted successfully" });
  }
}
module.exports = Delete;
