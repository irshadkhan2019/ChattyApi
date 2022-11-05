const express = require("express");
const SignIn = require("../controllers/signin");
const SignOut = require("../controllers/signout");
const loginSchema = require("../schemes/signin");
const signupSchema = require("../schemes/signup");

const SignUp = require("./../controllers/signup");
const validator = require("express-joi-validation").createValidator({});

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
