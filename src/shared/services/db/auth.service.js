const AuthModel = require("../../../features/auth/models/auth.schema");
const Helpers = require("../../globals/helpers/helpers");

class AuthService {
  //creates document in auth collection
  async createAuthUser(data) {
    await AuthModel.create(data);
  }

  async getUserByUsernameOrEmail(username, email) {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: Helpers.lowerCase(email) },
      ],
    };
    const user = await AuthModel.findOne(query).exec();
    return user;
  }
  //
  async getAuthUserByUsername(username) {
    const user = await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec();
    return user;
  }
}
const authService = new AuthService();

module.exports = authService;
