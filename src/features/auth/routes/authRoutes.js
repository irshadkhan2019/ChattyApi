const express = require("express");
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
    return this.router;
  }
}
const authRoutes = new AuthRoutes();
module.exports = authRoutes;
