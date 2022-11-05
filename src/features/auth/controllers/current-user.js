const userService = require("../../../shared/services/db/user.service");
const UserCache = require("../../../shared/services/redis/user.cache");
const { StatusCodes } = require("http-status-codes");

const userCache = new UserCache();
class CurrentUser {
  async read(req, res) {
    let isUser = false;
    let token = null;
    let user = null;

    console.log("CURRENT_USER", req.currentUser);
    const cachedUser = await userCache.getUserFromCache(
      `${req.currentUser?.userId}`
    );
    const existingUser = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser?.userId}`);

    console.log("EXISTING_USER", existingUser);
    if (Object.keys(existingUser).length > 0) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(StatusCodes.OK).json({
      token,
      isUser,
      user,
    });
  }
}
module.exports = CurrentUser;
