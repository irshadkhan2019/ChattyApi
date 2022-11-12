const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  followeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  createdAt: { type: Date, default: Date.now() },
});

const FollowerModel = mongoose.model("Follower", followerSchema);
module.exports = FollowerModel;
