const imageService = require("../../../shared/services/db/image.service");
const { StatusCodes } = require("http-status-codes");

class Get {
  async images(req, res) {
    const images = await imageService.getImages(req.params.userId);
    res.status(StatusCodes.OK).json({ message: "User images", images });
  }
}
module.exports = Get;
