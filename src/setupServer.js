const helmet = require("helmet");
const hpp = require("hpp");
const cookieSession = require("cookie-session");
const cors = require("cors");
const http = require("http");
const compression = require("compression");
const express = require("express");
const { config } = require("./config");
const redis = require("redis");
const redisAdapter = require("@socket.io/redis-adapter");
const applicationRoutes = require("./routes");
const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("./shared/globals/helpers/error-handler");
const { SocketIOPostHandler } = require("./shared/sockets/post");
const { SocketIOFollowerHandler } = require("./shared/sockets/follower");
const { SocketIOUserHandler } = require("./shared/sockets/user");
const {
  SocketIONotificationHandler,
} = require("./shared/sockets/notification");

const SERVER_PORT = 5000;

class ChattyServer {
  constructor(app) {
    this.app = app;
  }

  start() {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  securityMiddleware(app) {
    console.log("applying security");
    app.use(
      cookieSession({
        name: "session",
        keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== "development",
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
  }
  standardMiddleware(app) {
    console.log("applying Standard security");
    app.use(compression());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  }
  routesMiddleware(app) {
    applicationRoutes(app);
    console.log("Routes setup done!");
  }
  globalErrorHandler(app) {
    //for unknow urls
    app.all("*", (req, res) => {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `${req.originalUrl} Not Found`,
      });
    });

    //Global error handler
    app.use((err, req, res, next) => {
      console.log("reached GLOBAL ERROR HANDLER:::::", err);
      if (err instanceof CustomError) {
        return res.status(err.statusCode).json(err.serializeErrors());
      }
      next();
    });
  }

  async startServer(app) {
    console.log("Preparing to start server");
    try {
      const httpServer = new http.Server(app);
      //create socketIo server
      const socketIO = await this.createSocketIO(httpServer);

      this.startHTTPServer(httpServer);
      //pass IO to this Fn
      this.socketIOConnections(socketIO);
    } catch (error) {
      console.log(error);
    }
  }

  async createSocketIO(server) {
    //create socket server
    const io = require("socket.io")(server, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });

    console.log("created Socket Server");
    //redis server connection
    const pubClient = redis.createClient({
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
      // password: config.REDIS_PASSWORD,
    });

    console.log("created Redis Client");
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(redisAdapter.createAdapter(pubClient, subClient));
    return io;
  }
  startHTTPServer(http) {
    console.log("Starting server");
    http.listen(SERVER_PORT, () => {
      console.log(`Server running on port ${SERVER_PORT}`);
    });
  }
  socketIOConnections(io) {
    const postSocketHandler = new SocketIOPostHandler(io);
    const followerSocketHandler = new SocketIOFollowerHandler(io);
    const userSocketHandler = new SocketIOUserHandler(io);
    const notificationSocketHandler = new SocketIONotificationHandler();
    postSocketHandler.listen();
    followerSocketHandler.listen();
    userSocketHandler.listen();
    notificationSocketHandler.listen(io);
  }
}

module.exports = { ChattyServer };
