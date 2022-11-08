const { ServerError } = require("../../globals/helpers/error-handler");
const Helpers = require("../../globals/helpers/helpers");
const BaseCache = require("./base.cache");

class PostCache extends BaseCache {
  constructor() {
    super("postCache");
  }

  async savePostToCache(data) {
    const { key, currentUserId, uId, createdPost } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt,
    } = createdPost;

    const firstList = [
      "_id",
      `${_id}`,
      "userId",
      `${userId}`,
      "username",
      `${username}`,
      "email",
      `${email}`,
      "avatarColor",
      `${avatarColor}`,
      "profilePicture",
      `${profilePicture}`,
      "post",
      `${post}`,
      "bgColor",
      `${bgColor}`,
      "feelings",
      `${feelings}`,
      "privacy",
      `${privacy}`,
      "gifUrl",
      `${gifUrl}`,
    ];

    const secondList = [
      "commentsCount",
      `${commentsCount}`,
      "reactions",
      JSON.stringify(reactions), //object so stringify it .
      "imgVersion",
      `${imgVersion}`,
      "imgId",
      `${imgId}`,
      "createdAt",
      `${createdAt}`,
    ];
    const dataToSave = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount = await this.client.HMGET(
        `users:${currentUserId}`,
        "postsCount"
      );

      //Save in Sorted Set key value pair of userID-->postId
      await this.client.ZADD("post", {
        score: parseInt(uId, 10),
        value: `${key}`, //key is post ID
      });

      const multi = this.client.multi(); //to xecute multiple query at once

      //save post in hash with key as postID
      multi.HSET(`posts:${key}`, dataToSave);

      const count = parseInt(postCount[0], 10) + 1;
      //save the incremented count of post in users postcount
      multi.HSET(`users:${currentUserId}`, ["postsCount", count]);

      //xecute all queries
      multi.exec();
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  } //EOF

  async getPostsFromCache(key, start, end) {
    //key is cachename from where we need to retrive post i.e post
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi = this.client.multi();

      //fetch all posts
      for (const postId of reply) {
        multi.HGETALL(`posts:${postId}`);
      }

      const replies = await multi.exec(); //gets all posts
      const postReplies = [];

      for (const post of replies) {
        //parse json to convert from string to desired value
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`);
        post.reactions = Helpers.parseJson(`${post.reactions}`);
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  } //eof

  async getPostsWithImagesFromCache(key, start, end) {
    //key is cachename from where we need to retrive post i.e post
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi = this.client.multi();

      //fetch all posts
      for (const postId of reply) {
        multi.HGETALL(`posts:${postId}`);
      }

      const replies = await multi.exec(); //gets all posts
      const postWithImagesReplies = [];

      for (const post of replies) {
        //parse json to convert from string to desired value
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(`${post.commentsCount}`);
          post.reactions = Helpers.parseJson(`${post.reactions}`);
          post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
          postWithImagesReplies.push(post);
        }
      }

      return postWithImagesReplies;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  } //eof

  async getTotalPostsInCache() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count = await this.client.ZCARD("post");
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  } //eof

  async getUsersPostsFromCache(key, uId) {
    //key is cachename from where we need to retrive post i.e post
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //get posts oposted by uid SCORE
      const reply = await this.client.ZRANGE(key, uId, uId, {
        REV: true,
        BY: "SCORE",
      });
      const multi = this.client.multi();

      //fetch all posts
      for (const postId of reply) {
        multi.HGETALL(`posts:${postId}`);
      }

      const replies = await multi.exec(); //gets all posts
      const postReplies = [];

      for (const post of replies) {
        //parse json to convert from string to desired value
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`);
        post.reactions = Helpers.parseJson(`${post.reactions}`);
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  } //eof

  async getTotalUserPostsInCache(uId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count = await this.client.ZCOUNT("post", uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //key is postId
  async deletePostFromCache(key, currentUserId) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount = await this.client.HMGET(
        `users:${currentUserId}`,
        "postsCount"
      );
      const multi = this.client.multi();

      //remove from sorted Set
      multi.ZREM("post", `${key}`);
      //remove from hash
      multi.DEL(`posts:${key}`);

      const count = parseInt(postCount[0], 10) - 1;
      //dec count of users post
      multi.HSET(`users:${currentUserId}`, ["postsCount", count]);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
} //EOC

module.exports = PostCache;
