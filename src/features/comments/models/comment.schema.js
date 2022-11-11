const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true },
  comment: { type: String, default: "" },
  username: { type: String },
  avatarColor: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

const CommentsModel = mongoose.model("Comment", commentSchema);
module.exports = CommentsModel;
