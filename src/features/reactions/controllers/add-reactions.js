const { StatusCodes } = require("http-status-codes");
const reactionQueue = require("../../../shared/services/queues/reaction.queue");
const ReactionCache = require("../../../shared/services/redis/reaction.cache");
const ObjectId = require("mongodb").ObjectId;

const reactionCache = new ReactionCache();
class Add {
  async reaction(req, res) {
    const {
      userTo,
      postId,
      type,
      previousReaction,
      postReactions,
      profilePicture,
    } = req.body;

    const reactionObject = {
      _id: new ObjectId(),
      postId,
      type,
      avatarColor: req.currentUser?.avatarColor,
      username: req.currentUser?.username,
      profilePicture,
    };

    await reactionCache.savePostReactionToCache(
      postId,
      reactionObject,
      postReactions,
      type,
      previousReaction
    );

    //save to db
    const databaseReactionData = {
      postId,
      userTo,
      userFrom: req.currentUser?.userId,
      username: req.currentUser?.username,
      type,
      previousReaction,
      reactionObject,
    };
    reactionQueue.addReactionJob("addReactionToDB", databaseReactionData);

    res.status(StatusCodes.OK).json({ message: "Reaction added successfully" });
  }
}

module.exports = Add;
