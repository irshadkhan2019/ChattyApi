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
    Application.handleExit();
  }

  loadConfig() {
    console.log("loading configuration file");
    config.validateConfig();
    config.cloudinaryConfig();
  }

  static handleExit() {
    process.on("uncaughtException", (error) => {
      console.log(`There was an uncaught error: ${error}`);
      Application.shutDownProperly(1);
    });

    process.on("unhandleRejection", (reason) => {
      console.log(`Unhandled rejection at promise: ${reason}`);
      Application.shutDownProperly(2);
    });

    process.on("SIGTERM", () => {
      console.log("Caught SIGTERM");
      Application.shutDownProperly(2);
    });

    process.on("SIGINT", () => {
      console.log("Caught SIGINT");
      Application.shutDownProperly(2);
    });

    process.on("exit", () => {
      console.log("Exiting");
    });
  }

  static shutDownProperly(exitCode) {
    Promise.resolve()
      .then(() => {
        log.info("Shutdown complete");
        process.exit(exitCode);
      })
      .catch((error) => {
        log.error(`Error during shutdown: ${error}`);
        process.exit(1);
      });
  }
}

const application = new Application();
application.initialize();
