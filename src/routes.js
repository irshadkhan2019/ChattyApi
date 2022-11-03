const authRoutes = require("./features/auth/routes/authRoutes");
const { serverAdapter } = require("./shared/services/queues/base.queue");

const BASE_PATH = "/api/v1";
const applicationRoutes = (app) => {
  const routes = () => {
    app.use("/queues", serverAdapter.getRouter()); //GUI FOR QUEUES JOBS
    app.use(BASE_PATH, authRoutes.routes());
  };
  routes();
};

module.exports = applicationRoutes;
