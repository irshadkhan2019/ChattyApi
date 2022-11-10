const { omit } = require("lodash");
const PostModel = require("../../../features/post/models/post.schema");
const ReactionModel = require("../../../features/reactions/models/reaction.schema");
const UserCache = require("../redis/user.cache");

const userCache = new UserCache();

class ReactionService {
  async addReactionDataToDB(reactionData) {
    const {
      postId,
      userTo,
      userFrom,
      username,
      type,
      previousReaction,
      reactionObject,
    } = reactionData;

    let updatedReactionObject = reactionObject;
    if (previousReaction) {
      //while replacing reaction we need to change object id so remove it .
      updatedReactionObject = omit(reactionObject, ["_id"]);
    }
    const updateReaction = await Promise.all([
      //get user to whom a reaction was given to his post
      userCache.getUserFromCache(`${userTo}`),

      //if no reaction exist then create new else update it
      ReactionModel.replaceOne(
        { postId, type: previousReaction, username },
        updatedReactionObject,
        { upsert: true }
      ),

      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1,
          },
        },
        { new: true }
      ),
    ]);

    //send reactions notification to userTo
  }

  //
  async removeReactionDataFromDB(reactionData) {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
          },
        },
        { new: true }
      ),
    ]);
  }
}

const reactionService = new ReactionService();
module.exports = reactionService;
