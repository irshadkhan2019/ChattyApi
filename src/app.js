const express = require("express");
const { config } = require("./config");

const ConnectToDatabase = require("./setupDatabase");
const { ChattyServer } = require("./setupServer");

class Application {
  initialize() {
    this.loadConfig();
    ConnectToDatabase();
    const app = express();
    const server = new ChattyServer(app);
    server.start();
  }
  loadConfig() {
    console.log("loading configuration file");
    config.validateConfig();
  }
}

const application = new Application();
application.initialize();
