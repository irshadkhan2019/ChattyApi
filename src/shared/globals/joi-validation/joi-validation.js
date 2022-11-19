const { JoiRequestValidationError } = require("../helpers/error-handler");

function joiValidation(schema) {
  return async (req, res, next) => {
    const { error } = await Promise.resolve(schema.validate(req.body));
    if (error?.details) {
      throw new JoiRequestValidationError(error.details[0].message);
    }
  };
}

module.exports = joiValidation;
