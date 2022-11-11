const CommentsModel = require("../../../features/comments/models/comment.schema");
const PostModel = require("../../../features/post/models/post.schema");
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
