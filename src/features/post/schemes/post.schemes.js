const Joi = require("joi");

const postSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ""),
  bgColor: Joi.string().optional().allow(null, ""),
  privacy: Joi.string().optional().allow(null, ""),
  feelings: Joi.string().optional().allow(null, ""),
  gifUrl: Joi.string().optional().allow(null, ""),
  profilePicture: Joi.string().optional().allow(null, ""),
  imgVersion: Joi.string().optional().allow(null, ""),
  imgId: Joi.string().optional().allow(null, ""),
  image: Joi.string().optional().allow(null, ""),
});

const postWithImageSchema = Joi.object().keys({
  image: Joi.string().required().messages({
    "any.required": "Image is a required field",
    "string.empty": "Image property is not allowed to be empty",
  }),
  post: Joi.string().optional().allow(null, ""),
  bgColor: Joi.string().optional().allow(null, ""),
  privacy: Joi.string().optional().allow(null, ""),
  feelings: Joi.string().optional().allow(null, ""),
  gifUrl: Joi.string().optional().allow(null, ""),
  profilePicture: Joi.string().optional().allow(null, ""),
  imgVersion: Joi.string().optional().allow(null, ""),
  imgId: Joi.string().optional().allow(null, ""),
});

module.exports = { postSchema, postWithImageSchema };