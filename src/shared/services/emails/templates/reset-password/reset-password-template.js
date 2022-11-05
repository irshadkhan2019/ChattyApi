const fs = require("fs");
const ejs = require("ejs");

class ResetPasswordTemplate {
  passwordResetConfirmationTemplate(templateParams) {
    const { username, email, ipaddress, date } = templateParams;
    return ejs.render(
      fs.readFileSync(__dirname + "/reset-password-template.ejs", "utf8"),
      {
        username,
        email,
        ipaddress,
        date,
        image_url:
          "https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png",
      }
    );
  }
}

const resetPasswordTemplate = new ResetPasswordTemplate();
module.exports = resetPasswordTemplate;
