const PostModel = require("../../../features/post/models/post.schema");
const UserModel = require("../../../features/user/models/user.schema");

class PostService {
  async addPostToDB(userId, createdPost) {
    const post = PostModel.create(createdPost);
    const user = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: 1 } }
    );
    await Promise.all([post, user]);
  }

  async getPosts(query, skip = 0, limit = 0, sort) {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: "" } }, { gifUrl: { $ne: "" } }] };
    } else {
      postQuery = query;
    }

    const posts = await PostModel.aggregate([
      { $match: postQuery },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);
    return posts;
  }

  async postsCount() {
    const count = await PostModel.find({}).countDocuments();
    return count;
  }

  async deletePost(postId, userId) {
    const deletePost = PostModel.deleteOne({ _id: postId });
    //dec count of users post
    const decrementPostCount = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: -1 } }
    );
    await Promise.all([deletePost, decrementPostCount]);
  }

  async editPost(postId, updatedPost) {
    const updatePost = await PostModel.updateOne(
      { _id: postId },
      { $set: updatedPost }
    );
  }
} //eoc

const postService = new PostService();
module.exports = postService;
