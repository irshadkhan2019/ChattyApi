const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");

const authService = require("../../../shared/services/db/auth.service");
const { StatusCodes } = require("http-status-codes");
const JWT = require("jsonwebtoken");
const { config } = require("../../../config");
const userService = require("../../../shared/services/db/user.service");
const forgotPasswordTemplate = require("../../../shared/services/emails/templates/forgot-password/forgot-password-template");
const emailQueue = require("../../../shared/services/queues/email.queue");
const ip = require("ip");
const moment = require("moment");
const resetPasswordTemplate = require("../../../shared/services/emails/templates/reset-password/reset-password-template");

class SignIn {
  async read(req, res, next) {
    const { username, password } = req.body;
    const existingUser = await authService.getAuthUserByUsername(username);

    if (!existingUser) {
      return next(new BadRequestError("Invalid Credentials,check again"));
    }

    const passwordMatch = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      return next(new BadRequestError("Invalid Credentials ,incorrect pass"));
    }

    //get user Id
    const user = await userService.getUserByAuthId(`${existingUser._id}`);
    //if above all validation success generate jwt
    console.log("user from signin", user);
    const userJwt = JWT.sign(
      {
        userId: user?._id,
        uId: existingUser?.uId,
        email: existingUser?.email,
        username: existingUser?.username,
        avatarColor: existingUser?.avatarColor,
      },
      config.JWT_TOKEN
    );

    //create session
    req.session = { jwt: userJwt };
    console.log("session created", req.session);

    const userDocument = {
      ...user,
      authId: existingUser?._id,
      uId: existingUser?.uId,
      email: existingUser?.email,
      username: existingUser?.username,
      avatarColor: existingUser?.avatarColor,
      createdAt: existingUser?.createdAt,
    };

    //send res
    res.status(StatusCodes.OK).json({
      message: "Authentication successfull",
      user: userDocument,
      token: userJwt,
    });
  }
}

module.exports = SignIn;
