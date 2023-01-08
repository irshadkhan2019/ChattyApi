const { config } = require("./../../../config");
const BaseCache = require("./base.cache");

class RedisConnection extends BaseCache {
  constructor() {
    super("redisConnection");
  }

  async connect() {
    try {
      // console.log("Inside redisConnection", this.client, this.cacheName);
      await this.client.connect();
      const res = await this.client.ping();
      console.log("Connected to redis cache", res);
    } catch (error) {
      console.log(error);
    }
  }
}

const redisConnection = new RedisConnection();

module.exports = redisConnection;
