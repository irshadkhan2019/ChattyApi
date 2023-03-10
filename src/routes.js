const authRoutes = require("./features/auth/routes/authRoutes");
const currentUserRoutes = require("./features/auth/routes/currentRoutes");
const authMiddleware = require("./shared/globals/helpers/auth-middleware");
const { serverAdapter } = require("./shared/services/queues/base.queue");
const express = require("express");
const postRoutes = require("./features/post/routes/postRoutes");
const reactionRoutes = require("./features/reactions/routes/reactionRoutes");
const commentRoutes = require("./features/comments/routes/commentRoutes");
const followerRoutes = require("./features/followers/routes/followerRoutes");
const notificationRoutes = require("./features/notifications/routes/notificationRoutes");
const imageRoutes = require("./features/images/routes/imageRoutes");
const chatRoutes = require("./features/chat/routes/chatRoutes");
const userRoutes = require("./features/user/routes/userRoutes");
const healthRoutes = require("./features/user/routes/healthRoutes");

const BASE_PATH = "/api/v1";
const applicationRoutes = (app) => {
  const routes = () => {
    app.use("/queues", serverAdapter.getRouter()); //GUI FOR QUEUES JOBS
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authRoutes.routes());
    app.use("", healthRoutes.health());
    app.use("", healthRoutes.env());
    app.use("", healthRoutes.instance());
    app.use("", healthRoutes.fiboRoutes());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
  };
  routes();
};

module.exports = applicationRoutes;
