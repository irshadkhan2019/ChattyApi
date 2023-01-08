const { NotAuthorizedError } = require("./error-handler");
const JWT = require("jsonwebtoken");
const { config } = require("../../../config");

class AuthMiddleware {
  verifyUser(req, res, next) {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError("Token unavailable .Login again!");
    }
    try {
      const payload = JWT.verify(req.session?.jwt, config.JWT_TOKEN);
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError(
        "Token unavailable bad happened.Login again!"
      );
    }
    next();
  }

  checkAuthentication(req, res, next) {
    if (!req.currentUser) {
      throw new NotAuthorizedError("Authentication required!");
    }
    next();
  }
}

const authMiddleware = new AuthMiddleware();

module.exports = authMiddleware;
