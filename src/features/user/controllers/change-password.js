const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const authService = require("../../../shared/services/db/auth.service");
const publicIP = require("ip");
const moment = require("moment");
const resetPasswordTemplate = require("../../../shared/services/emails/templates/reset-password/reset-password-template");
const emailQueue = require("../../../shared/services/queues/email.queue");
const { StatusCodes } = require("http-status-codes");
const userService = require("../../../shared/services/db/user.service");

class Update {
  async password(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError("Passwords do not match.");
    }
    const existingUser = await authService.getAuthUserByUsername(
      req.currentUser?.username
    );
    const passwordsMatch = await existingUser.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    const hashedPassword = await existingUser.hashPassword(newPassword);
    userService.updatePassword(`${req.currentUser?.username}`, hashedPassword);

    const templateParams = {
      username: existingUser?.username,
      email: existingUser?.email,
      ipaddress: publicIP.address(),
      date: moment().format("DD//MM//YYYY HH:mm"),
    };

    const template =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    emailQueue.addEmailJob("changePassword", {
      template,
      receiverEmail: existingUser?.email,
      subject: "Password update confirmation",
    });
    res.status(StatusCodes.OK).json({
      message:
        "Password updated successfully. You will be redirected shortly to the login page.",
    });
  }
}
module.exports = Update;
