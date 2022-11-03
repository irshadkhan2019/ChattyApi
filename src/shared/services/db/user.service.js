const UserModel = require("../../../features/user/models/user.schema");

class UserService {
  //creates document in auth collection
  async addUserData(data) {
    await UserModel.create(data);
  }
}
const userService = new UserService();

module.exports = userService;
