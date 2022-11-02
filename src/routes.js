const authRoutes = require("./features/auth/routes/authRoutes");

const BASE_PATH = "/api/v1";
const applicationRoutes = (app) => {
  const routes = () => {
    app.use(BASE_PATH, authRoutes.routes());
  };
  routes();
};

module.exports = applicationRoutes;
