const { default: mongoose } = require("mongoose");
const CommentsModel = require("../../../features/comments/models/comment.schema");
const NotificationModel = require("../../../features/notifications/models/notification.schema");
const PostModel = require("../../../features/post/models/post.schema");
const notificationTemplate = require("../emails/templates/notifications/notification-template");
const emailQueue = require("../queues/email.queue");
const UserCache = require("../redis/user.cache");

const userCache = new UserCache();

class CommentService {
  async addCommentToDB(commentData) {
    const { postId, userTo, userFrom, comment, username } = commentData; // sent from controller.
    //create comment
    const comments = CommentsModel.create(comment);
    //change /inc  comment count in db
    const post = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    const user = userCache.getUserFromCache(userTo);
    const response = await Promise.all([comments, post, user]);

    //send notification
    //check if user have not blocked comment notification and he is not commenting his own post
    if (response[2].notifications.comments && userFrom !== userTo) {
      const notificationModel = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: "comment",
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id), //comment obj id
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId,
        imgVersion: response[1].imgVersion,
        gifUrl: response[1].gifUrl,
        reaction: "",
      });

      //emit event to client that a comment was inserted
      const socketIONotificationObject = getSocketServerInstance();
      socketIONotificationObject.emit("insert notification", notifications, {
        userTo,
      });

      //data for email template
      const templateParams = {
        username: response[2].username,
        message: `${username} commented on your post.`,
        header: "Comment Notification",
      };
      //create email UI template
      const template =
        notificationTemplate.notificationMessageTemplate(templateParams);

      //send email regarding notfication to user
      emailQueue.addEmailJob("commentsEmail", {
        receiverEmail: response[2].email,
        template,
        subject: "Post notification",
      });
    }
  }

  async getPostComments(query, sort) {
    const comments = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return comments;
  }

  async getPostCommentNames(query, sort) {
    const commentsNamesList = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      {
        $group: {
          _id: null,
          names: { $addToSet: "$username" },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]);
    return commentsNamesList;
  }
}

const commentService = new CommentService();
module.exports = commentService;
