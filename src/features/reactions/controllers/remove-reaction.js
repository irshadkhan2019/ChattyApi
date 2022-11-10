const { StatusCodes } = require("http-status-codes");
const reactionQueue = require("../../../shared/services/queues/reaction.queue");
const ReactionCache = require("../../../shared/services/redis/reaction.cache");

const reactionCache = new ReactionCache();

class Remove {
  async reaction(req, res) {
    const { postId, previousReaction, postReactions } = req.params;
    await reactionCache.removePostReactionFromCache(
      postId,
      `${req.currentUser?.username}`,
      JSON.parse(postReactions) //convert to obj since all properties are in strings in req.params
    );
    const databaseReactionData = {
      postId,
      username: req.currentUser?.username,
      previousReaction,
    };
    reactionQueue.addReactionJob("removeReactionFromDB", databaseReactionData);
    res.status(StatusCodes.OK).json({ message: "Reaction removed from post" });
  }
}
module.exports = Remove;
