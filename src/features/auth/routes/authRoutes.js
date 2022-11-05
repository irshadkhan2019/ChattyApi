const express = require("express");
const Password = require("../controllers/password");
const SignIn = require("../controllers/signin");
const SignOut = require("../controllers/signout");
const loginSchema = require("../schemes/signin");
const signupSchema = require("../schemes/signup");

const SignUp = require("./../controllers/signup");
const validator = require("express-joi-validation").createValidator({});
const { emailSchema, passwordSchema } = require("./../schemes/password");

class AuthRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.post(
      "/signup",
      validator.body(signupSchema),
      SignUp.prototype.create
    );
    this.router.post(
      "/signin",
      validator.body(loginSchema),
      SignIn.prototype.read
    );
    this.router.post(
      "/forgot-password",
      validator.body(emailSchema),
      Password.prototype.create
    );
    this.router.post(
      "/reset-password/:token",
      validator.body(passwordSchema),
      Password.prototype.update
    );
    return this.router;
  }

  //need to be authenticated to sign out so keep it seperate
  signoutRoute() {
    this.router.get("/signout", SignOut.prototype.update);
    return this.router;
  }
}
const authRoutes = new AuthRoutes();
module.exports = authRoutes;
