const {
  uploads,
} = require("../../../shared/globals/helpers/cloudinary-upload");
const {
  BadRequestError,
} = require("../../../shared/globals/helpers/error-handler");
const Helpers = require("../../../shared/globals/helpers/helpers");
const authService = require("../../../shared/services/db/auth.service");
const ObjectID = require("mongodb").ObjectId;
const { StatusCodes } = require("http-status-codes");

class SignUp {
  async create(req, res) {
    const { username, password, email, avatarColor, avatarImage } = req.body;

    const checkIfUserExist = await authService.getUserByUsernameOrEmail(
      username,
      email
    );

    if (checkIfUserExist) {
      throw new BadRequestError("Invalid Credentials");
    }

    //generate our own _id for doc instead of mogodb generating it
    const authObjectId = new ObjectID();
    const userObjectId = new ObjectID();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    const authData = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor,
    });

    //upload img to cloudinary with custom img id same as userId

    const result = await uploads(avatarImage, `${userObjectId}`, true, true);
    //creates https://res.cloudinary.com/123/userObjectId

    //if uploads fails we don't get public_id
    if (!result?.public_id) {
      throw new BadRequestError("File upload error occured try again");
    }
    console.log(StatusCodes.CREATED);
    res.status(200).json({ message: "user created successfully", authData });
  }

  //transform data
  signupData(data) {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date(),
    };
  }
}
module.exports = SignUp;
