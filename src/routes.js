const authRoutes = require("./features/auth/routes/authRoutes");
const currentUserRoutes = require("./features/auth/routes/currentRoutes");
const authMiddleware = require("./shared/globals/helpers/auth-middleware");
const { serverAdapter } = require("./shared/services/queues/base.queue");
const express = require("express");
const postRoutes = require("./features/post/routes/postRoutes");

const BASE_PATH = "/api/v1";
const applicationRoutes = (app) => {
  const routes = () => {
    app.use("/queues", serverAdapter.getRouter()); //GUI FOR QUEUES JOBS
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
  };
  routes();
};

module.exports = applicationRoutes;
