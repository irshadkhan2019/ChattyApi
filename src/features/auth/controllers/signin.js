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
      return next(new BadRequestError("Invalid Credentials"));
    }

    const passwordMatch = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      return next(new BadRequestError("Invalid Credentials"));
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

    const userDocument = {
      ...user,
      authId: existingUser?._id,
      uId: existingUser?.uId,
      email: existingUser?.email,
      username: existingUser?.username,
      avatarColor: existingUser?.avatarColor,
      createdAt: existingUser?.createdAt,
    };

    // //forgotpass test
    // const resetLink = `${config.CLIENT_URL}/reset-password?token=128761uy8sdhg2tdshdg624gh`;
    // const template = forgotPasswordTemplate.passwordResetTemplate(
    //   existingUser.username,
    //   resetLink
    // );

    // emailQueue.addEmailJob("forgotPasswordEmail", {
    //   template,
    //   receiverEmail: "daniela.bailey21@ethereal.email",
    //   subject: "Reset your password",
    // });

    //resetPass test
    // const templateParams = {
    //   username: existingUser.username,
    //   email: existingUser.email,
    //   ipaddress: ip.address(),
    //   date: moment().format("DD/MM/YYYY HH:mm"),
    // };
    // const template =
    //   resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob("forgotPasswordEmail", {
    //   template,
    //   receiverEmail: "daniela.bailey21@ethereal.email",
    //   subject: "Password reset Confirmation",
    // });

    //send res
    res.status(StatusCodes.OK).json({
      message: "Authentication successfull",
      user: userDocument,
      token: userJwt,
    });
  }
}

module.exports = SignIn;
