const Joi = require("joi");

const addChatSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, ""),
  receiverId: Joi.string().required(),
  receiverUsername: Joi.string().required(),
  receiverAvatarColor: Joi.string().required(),
  receiverProfilePicture: Joi.string().allow(null, ""),
  body: Joi.string().optional().allow(null, ""),
  gifUrl: Joi.string().optional().allow(null, ""),
  selectedImage: Joi.string().optional().allow(null, ""),
  isRead: Joi.boolean().optional(),
});

const markChatSchema = Joi.object().keys({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required(),
});

module.exports = { addChatSchema, markChatSchema };
