const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true },
  type: { type: String, default: "" },
  username: { type: String, default: "" },
  avatarColor: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now() },
});

const ReactionModel = mongoose.model("Reaction", reactionSchema);

module.exports = ReactionModel;
