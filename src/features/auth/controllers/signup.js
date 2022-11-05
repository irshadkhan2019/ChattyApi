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
const UserCache = require("../../../shared/services/redis/user.cache");
const { omit } = require("lodash");
const authQueue = require("../../../shared/services/queues/auth.queue");
const userQueue = require("../../../shared/services/queues/user.queue");
const JWT = require("jsonwebtoken");
const { config } = require("../../../config");

const userCache = new UserCache();
class SignUp {
  async create(req, res) {
    console.log(req.body);
    const { username, password, email, avatarColor, avatarImage } = req.body;

    const checkIfUserExist = await authService.getUserByUsernameOrEmail(
      username,
      email
    );

    if (checkIfUserExist) {
      throw new BadRequestError("Invalid Credentials");
    }

    //generate our own _id for doc instead of mongodb generating it
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

    //add User to redis cache
    const userDataForCache = SignUp.prototype.userData(authData, userObjectId);
    //set profile pic same as what we uploaded in cloudinary
    userDataForCache.profilePicture = `https://res.cloudinary.com/dnslnpn4l/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    //save user data to database
    //In user collection dont add these fields while saving in db
    omit(userDataForCache, [
      "uId",
      "username",
      "email",
      "avatarColor",
      "password",
    ]);

    //add to Queue as an job so that worker can add this to db later
    //auth and user collections are /filled with docs via the workers of the queues .
    authQueue.addAuthUserJob("addAuthUserToDB", { value: authData });
    userQueue.addUserJob("addUserToDB", { value: userDataForCache });

    //create Token
    const userJwt = SignUp.prototype.signToken(authData, userObjectId);
    //add data to session
    req.session = { jwt: userJwt };
    //send res to user

    res.status(StatusCodes.CREATED).json({
      message: "user created successfully",
      user: userDataForCache,
      token: userJwt,
    });
  }

  //create Token
  signToken(data, userObjectId) {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_TOKEN
    );
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

  //Creating user model data from auth data when user registers
  userData(data, userObjectId) {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: "",
      blocked: [],
      blockedBy: [],
      work: "",
      location: "",
      school: "",
      quote: "",
      bgImageVersion: "",
      bgImageId: "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true,
      },
      social: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
      },
    };
  }
  //
}
module.exports = SignUp;
