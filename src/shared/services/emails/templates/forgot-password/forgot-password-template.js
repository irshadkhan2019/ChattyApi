const fs = require("fs");
const ejs = require("ejs");

class ForgotPasswordTemplate {
  passwordResetTemplate(username, resetLink) {
    return ejs.render(
      fs.readFileSync(__dirname + "/forgot-password-template.ejs", "utf-8"),
      {
        username,
        resetLink,
        image_url:
          "https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png",
      }
    );
  }
}
const forgotPasswordTemplate = new ForgotPasswordTemplate();

module.exports = forgotPasswordTemplate;
