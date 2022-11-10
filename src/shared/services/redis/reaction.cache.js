const Helpers = require("../../globals/helpers/helpers");
const BaseCache = require("./base.cache");
const { find } = require("lodash");
class ReactionCache extends BaseCache {
  constructor() {
    super("reactionsCache");
  }

  async savePostReactionToCache(
    postId,
    reaction,
    postReactions,
    type,
    previousReaction
  ) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      //client react will send this .
      if (previousReaction) {
        this.removePostReactionFromCache(
          postId,
          reaction.username,
          postReactions
        );
      }

      if (type) {
        await this.client.LPUSH(
          `reactions:${postId}`,
          JSON.stringify(reaction)
        );
        const dataToSave = ["reactions", JSON.stringify(postReactions)];
        await this.client.HSET(`posts:${postId}`, dataToSave);
      }
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //  "postReactions": {"like": 0 ,"love": 0,"happy": 0,"sad": 1,"wow": 0,"angry": 0},
  async removePostReactionFromCache(postId, username, postReactions) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const multi = this.client.multi();
      console.log("removing previous reaction of user", username);
      const userPreviousReaction = this.getPreviousReaction(response, username);
      //remove old reaction of user who is changing his reaction .
      multi.LREM(
        `reactions:${postId}`,
        1,
        JSON.stringify(userPreviousReaction)
      );
      await multi.exec();

      //save the new changed reqaction
      const dataToSave = ["reactions", JSON.stringify(postReactions)];
      await this.client.HSET(`posts:${postId}`, dataToSave);
    } catch (error) {
      console.log(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  getPreviousReaction(response, username) {
    const list = [];
    for (const item of response) {
      list.push(Helpers.parseJson(item));
    }
    return find(list, (listItem) => {
      return listItem.username === username;
    });
  }
} //eoc

module.exports = ReactionCache;
