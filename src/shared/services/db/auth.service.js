const AuthModel = require("../../../features/auth/models/auth.schema");
const Helpers = require("../../globals/helpers/helpers");

class AuthService {
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
}
const authService = new AuthService();

module.exports = authService;
