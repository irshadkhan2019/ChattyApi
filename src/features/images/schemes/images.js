const Joi = require("joi");

const addImageSchema = Joi.object().keys({
  image: Joi.string().required(),
});

module.exports = addImageSchema;
