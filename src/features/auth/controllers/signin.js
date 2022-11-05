const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");

const authService = require("../../../shared/services/db/auth.service");
const { StatusCodes } = require("http-status-codes");
const JWT = require("jsonwebtoken");
const { config } = require("../../../config");
const userService = require("../../../shared/services/db/user.service");

class SignIn {
  async read(req, res) {
    const { username, password } = req.body;
    const existingUser = await authService.getAuthUserByUsername(username);

    if (!existingUser) {
      throw new BadRequestError("Invalid Credentials");
    }

    const passwordMatch = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestError("Invalid Credentials");
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
    //send res
    res.status(StatusCodes.OK).json({
      message: "Authentication successfull",
      user: userDocument,
      token: userJwt,
    });
  }
}

module.exports = SignIn;
