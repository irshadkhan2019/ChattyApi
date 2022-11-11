const reactionService = require("../../../shared/services/db/reaction.service");
const ReactionCache = require("../../../shared/services/redis/reaction.cache");
const { StatusCodes } = require("http-status-codes");
const reactionCache = new ReactionCache();

class Get {
  async reactions(req, res) {
    const { postId } = req.params;
    const cachedReactions = await reactionCache.getReactionsFromCache(postId);
    const reactions = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getPostReactions(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );
    res.status(StatusCodes.OK).json({
      message: "Post reactions",
      reactions: reactions[0],
      count: reactions[1],
    });
  }

  async singleReactionByUsername(req, res) {
    const { postId, username } = req.params;
    const cachedReaction =
      await reactionCache.getSingleReactionByUsernameFromCache(
        postId,
        username
      );
    const reactions = cachedReaction.length
      ? cachedReaction
      : await reactionService.getSinglePostReactionByUsername(postId, username);
    res.status(StatusCodes.OK).json({
      message: "Single post reaction by username",
      reactions: reactions.length ? reactions[0] : {},
      count: reactions.length ? reactions[1] : 0,
    });
  }

  async reactionsByUsername(req, res) {
    const { username } = req.params;
    console.log("getting reaction by username", username);

    const reactions = await reactionService.getReactionsByUsername(username);
    res
      .status(StatusCodes.OK)
      .json({ message: "All user reactions by username", reactions });
  }
}

module.exports = Get;
