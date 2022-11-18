const { default: mongoose } = require("mongoose");
const ImageModel = require("../../../features/images/models/image.schema");
const UserModel = require("../../../features/user/models/user.schema");

class ImageService {
  async addUserProfileImageToDB(userId, url, imgId, imgVersion) {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { profilePicture: url } }
    );
    await this.addImage(userId, imgId, imgVersion, "profile");
  }

  async addBackgroundImageToDB(userId, imgId, imgVersion) {
    console.log("USERMODEL", userId, imgId, imgVersion);
    await UserModel.updateOne(
      { _id: userId },
      { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }
    );
    await this.addImage(userId, imgId, imgVersion, "background");
  }

  async addImage(userId, imgId, imgVersion, type) {
    await ImageModel.create({
      userId,
      bgImageVersion: type === "background" ? imgVersion : "",
      bgImageId: type === "background" ? imgId : "",
      imgVersion,
      imgId,
    });
  }

  async removeImageFromDB(imageId) {
    await ImageModel.deleteOne({ _id: imageId });
  }

  async getImageByBackgroundId(bgImageId) {
    const image = await ImageModel.findOne({ bgImageId });
    return image;
  }

  async getImages(userId) {
    const images = await ImageModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    ]);
    return images;
  }
} //eoc

const imageService = new ImageService();
module.exports = imageService;
