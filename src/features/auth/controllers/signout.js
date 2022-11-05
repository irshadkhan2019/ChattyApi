const { StatusCodes } = require("http-status-codes");

class SignOut {
  async update(req, res) {
    req.session = null;
    res.status(StatusCodes.OK).json({
      message: "Logout Successful",
      user: {},
      token: "",
    });
  }
}
module.exports = SignOut;
