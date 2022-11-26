const { StatusCodes } = require("http-status-codes");
const Helpers = require("../../../shared/globals/helpers/helpers");
const userService = require("../../../shared/services/db/user.service");

class Search {
  async user(req, res) {
    const regex = new RegExp(Helpers.escapeRegex(req.params.query), "i");
    const users = await userService.searchUsers(regex);
    res
      .status(StatusCodes.OK)
      .json({ message: "Search results", search: users });
  }
}
module.exports = Search;
