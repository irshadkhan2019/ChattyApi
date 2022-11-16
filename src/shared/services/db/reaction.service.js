const { omit } = require("lodash");
const { default: mongoose } = require("mongoose");
const NotificationModel = require("../../../features/notifications/models/notification.schema");
const PostModel = require("../../../features/post/models/post.schema");
const ReactionModel = require("../../../features/reactions/models/reaction.schema");
const { getSocketServerInstance } = require("../../../ioServerStore");
const Helpers = require("../../globals/helpers/helpers");
const notificationTemplate = require("../emails/templates/notifications/notification-template");
const emailQueue = require("../queues/email.queue");
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
    const updatedReaction = await Promise.all([
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
    if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
      const notificationModel = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom,
        userTo: userTo,
        message: `${username} reacted to your post.`,
        notificationType: "reactions",
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(updatedReaction[1]._id),
        createdAt: new Date(),
        comment: "",
        post: updatedReaction[2].post,
        imgId: updatedReaction[2].imgId,
        imgVersion: updatedReaction[2].imgVersion,
        gifUrl: updatedReaction[2].gifUrl,
        reaction: type,
      });
      //emit event to client that a reaction notification was inserted
      const socketIONotificationObject = getSocketServerInstance();
      socketIONotificationObject.emit("insert notification", notifications, {
        userTo,
      });

      const templateParams = {
        username: updatedReaction[0].username,
        message: `${username} reacted to your post.`,
        header: "Post Reaction Notification",
      };
      const template =
        notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob("reactionsEmail", {
        receiverEmail: updatedReaction[0].email,
        template,
        subject: "Post reaction notification",
      });
    }
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
  //get reactions

  async getPostReactions(query, sort) {
    const reactions = await ReactionModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);

    return [reactions, reactions.length];
  }

  async getSinglePostReactionByUsername(postId, username) {
    const reactions = await ReactionModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
          username: Helpers.firstLetterUppercase(username),
        },
      },
    ]);

    return reactions.length ? [reactions[0], 1] : [];
  }

  async getReactionsByUsername(username) {
    const reactions = await ReactionModel.aggregate([
      {
        $match: {
          username: Helpers.firstLetterUppercase(username),
        },
      },
    ]);
    console.log("getting reaction by username", username, reactions);
    return reactions;
  }
} //eoc

const reactionService = new ReactionService();
module.exports = reactionService;
