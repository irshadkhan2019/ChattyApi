const nodemailer = require("nodemailer");
const sendGridMail = require("@sendgrid/mail");
const { config } = require("../../../config");
const { BadRequestError } = require("./../../globals/helpers/error-handler");

sendGridMail.setApiKey(config.SENDGRID_API_KEY);

class MailTransport {
  async sendEmail(receiverEmail, subject, body) {
    if (config.NODE_ENV === "test" || config.NODE_ENV === "development") {
      this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  async developmentEmailSender(receiverEmail, subject, body) {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Development email sent successfully.");
    } catch (error) {
      console.log("Error sending email", error);
      return new BadRequestError("Error sending email");
    }
  }

  async productionEmailSender(receiverEmail, subject, body) {
    const mailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body,
    };

    try {
      await sendGridMail.send(mailOptions);
      console.log("Production email sent successfully.");
    } catch (error) {
      console.log("Error sending email", error);
      throw new BadRequestError("Error sending email");
    }
  }
}

const mailTransport = new MailTransport();
module.exports = mailTransport;
