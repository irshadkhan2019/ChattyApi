const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const authService = require("../../../shared/services/db/auth.service");
const crypto = require("crypto");
const forgotPasswordTemplate = require("../../../shared/services/emails/templates/forgot-password/forgot-password-template");
const { StatusCodes } = require("http-status-codes");
const ip = require("ip");
const moment = require("moment");
const resetPasswordTemplate = require("../../../shared/services/emails/templates/reset-password/reset-password-template");
const { config } = require("../../../config");
const emailQueue = require("../../../shared/services/queues/email.queue");

class Password {
  async create(req, res, next) {
    const { email } = req.body;
    const existingUser = await authService.getAuthUserByEmail(email);

    if (!existingUser) {
      return next(new BadRequestError("No such user exist,pls verify email."));
    }

    const randomBytes = await Promise.resolve(crypto.randomBytes(20));
    const randomTokenCharacters = randomBytes.toString("hex");
    await authService.updatePasswordToken(
      `${existingUser._id}`,
      randomTokenCharacters,
      Date.now() * 60 * 60 * 1000
    );

    //forgot pass token link mail send procedure
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomTokenCharacters}`;

    //create mail template
    const template = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username,
      resetLink
    );

    //add as a job so that workers can send mail
    emailQueue.addEmailJob("forgotPasswordEmail", {
      template,
      receiverEmail: email,
      subject: "Reset your password",
    });

    res.status(StatusCodes.OK).json({ message: "Password reset email sent." });
  }
  //
  async update(req, res, next) {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    const existingUser = await authService.getAuthUserByPasswordToken(token);

    if (!existingUser) {
      return next(new BadRequestError("reset token expired"));
    }

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    //after password changes in db send user mail

    const templateParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: ip.address(),
      date: moment().format("DD/MM/YYYY HH:mm"),
    };
    //create template for mail
    const template =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    //dispatch job for worker
    emailQueue.addEmailJob("forgotPasswordEmail", {
      template,
      receiverEmail: existingUser.email,
      subject: "Password reset Confirmation",
    });

    //send res
    res
      .status(StatusCodes.OK)
      .json({ message: "Password successfully updated." });
  }
}

module.exports = Password;
