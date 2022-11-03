const redis = require("redis");
const { config } = require("../../../config");

//Base redis cache config class
class BaseCache {
  constructor(cacheName) {
    this.cacheName = cacheName;
    this.client = redis.createClient({
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
      password: config.REDIS_PASSWORD,
    });
  }
  cacheError() {
    this.client.on("error", (error) => {
      console.log(this.cacheName, error);
    });
  }
}
module.exports = BaseCache;
