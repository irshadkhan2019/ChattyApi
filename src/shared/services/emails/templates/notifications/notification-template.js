const fs = require("fs");
const ejs = require("ejs");

class NotificationTemplate {
  notificationMessageTemplate(templateParams) {
    const { username, header, message } = templateParams;
    return ejs.render(
      fs.readFileSync(__dirname + "/notification.ejs", "utf-8"),
      {
        username,
        header,
        message,
        image_url:
          "https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png",
      }
    );
  }
}

const notificationTemplate = new NotificationTemplate();
module.exports = notificationTemplate;
