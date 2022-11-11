const BaseCache = require("./base.cache");
const { find } = require("lodash");
const { ServerError } = require("../../globals/helpers/error-handler");
const Helpers = require("../../globals/helpers/helpers");

class CommentCache extends BaseCache {
  constructor() {
    super("commentsCache");
  }
  async savePostCommentToCache(postId, value) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //push comment is list
      await this.client.LPUSH(`comments:${postId}`, value);

      //inc comment in post code
      const commentsCount = await this.client.HMGET(
        `posts:${postId}`,
        "commentsCount"
      );
      let count = Helpers.parseJson(commentsCount[0]);
      count += 1;
      const dataToSave = ["commentsCount", `${count}`];
      await this.client.HSET(`posts:${postId}`, dataToSave);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async getCommentsFromCache(postId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item));
      }
      return list;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async getCommentsNamesFromCache(postId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const commentsCount = await this.client.LLEN(`comments:${postId}`);
      const comments = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list = [];
      for (const item of comments) {
        const comment = Helpers.parseJson(item);
        list.push(comment.username);
      }
      const response = {
        count: commentsCount,
        names: list,
      };
      return [response];
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  async getSingleCommentFromCache(postId, commentId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const comments = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list = [];
      for (const item of comments) {
        list.push(Helpers.parseJson(item));
      }
      //get the specified comment
      const result = find(list, (listItem) => {
        return listItem._id === commentId;
      });

      return [result];
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }
} //eoc

module.exports = CommentCache;
