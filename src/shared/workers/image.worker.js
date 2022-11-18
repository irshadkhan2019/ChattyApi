const imageService = require("../services/db/image.service");

class ImageWorker {
  async addUserProfileImageToDB(job, done) {
    try {
      const { userId, url, imgId, imgVersion } = job.data;
      //add method to send data to DB
      await imageService.addUserProfileImageToDB(
        userId,
        url,
        imgId,
        imgVersion
      );
      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async updateBGImageInDB(job, done) {
    try {
      const { userId, imgId, imgVersion } = job.data;
      //add method to send data to DB
      await imageService.addBackgroundImageToDB(userId, imgId, imgVersion);
      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
  async addImageToDB(job, done) {
    try {
      const { userId, imgId, imgVersion } = job.data;
      //add method to send data to DB
      await imageService.addImage(userId, imgId, imgVersion, "");
      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async removeImageFromDB(job, done) {
    try {
      const { imageId } = job.data;
      //add method to send data to DB
      await imageService.removeImageFromDB(imageId);
      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
} //eoc
const imageWorker = new ImageWorker();
module.exports = imageWorker;
