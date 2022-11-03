const mongoose = require("mongoose");
const { config } = require("./config");
const redisConnection = require("./shared/services/redis/redis.connection");

const ConnectToDatabase = () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        console.log("Successfully connected to database.");
        //connect redis cache
        redisConnection.connect();
      })
      .catch((error) => {
        console.log("Error connecting to database", error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on("disconnected", connect);
};

module.exports = ConnectToDatabase;
