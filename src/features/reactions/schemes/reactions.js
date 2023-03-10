const Joi = require("joi");

const addReactionSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    "any.required": "userTo is a required property",
  }),
  postId: Joi.string().required().messages({
    "any.required": "postId is a required property",
  }),
  type: Joi.string().required().messages({
    "any.required": "Reaction type is a required property",
  }),
  profilePicture: Joi.string().optional().allow(null, ""),
  previousReaction: Joi.string().optional().allow(null, ""),
  postReactions: Joi.object().optional().allow(null, ""),
});

const removeReactionSchema = Joi.object().keys({
  postReactions: Joi.object().optional().allow(null, ""),
});

module.exports = { addReactionSchema, removeReactionSchema };
