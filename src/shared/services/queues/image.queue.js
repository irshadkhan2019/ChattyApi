const imageWorker = require("../../workers/image.worker");
const { BaseQueue } = require("./base.queue");

class ImageQueue extends BaseQueue {
  constructor() {
    super("image");
    this.processJob(
      "addUserProfileImageToDB",
      5,
      imageWorker.addUserProfileImageToDB
    );
    this.processJob("updateBGImageInDB", 5, imageWorker.updateBGImageInDB);
    this.processJob("addImageToDB", 5, imageWorker.addImageToDB);
    this.processJob("removeImageFromDB", 5, imageWorker.removeImageFromDB);
  }

  addImageJob(name, data) {
    this.addJob(name, data);
  }
}

const imageQueue = new ImageQueue();

module.exports = imageQueue;
