const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const SALT_ROUND = 10;

const authSchema = new mongoose.Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    //in option we tell while retrieving doc dont send password field .
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

authSchema.pre("save", async function (next) {
  const hashedPassword = await bcrypt.hash(this.password, SALT_ROUND);
  this.password = hashedPassword;
  next();
});

authSchema.methods.comparePassword = async function (password) {
  const hashedPassword = this.password;
  return bcrypt.compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password) {
  return bcrypt.hash(password, SALT_ROUND);
};

const AuthModel = mongoose.model("Auth", authSchema);

module.exports = AuthModel;
