const { default: mongoose } = require("mongoose");

const imageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  bgImageVersion: { type: String, default: "" },
  bgImageId: { type: String, default: "" },
  imgVersion: { type: String, default: "" },
  imgId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, index: true },
});

const ImageModel = mongoose.model("Image", imageSchema);
module.exports = ImageModel;
