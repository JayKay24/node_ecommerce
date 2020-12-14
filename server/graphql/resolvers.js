const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

module.exports = {
  createUser: async ({ userInput }, req) => {
    const { email, name, password } = userInput;
    const errors = [];
    const passwordInvalid =
      validator.isEmpty(password) || !validator.isLength(password, { min: 5 });
    if (!validator.isEmail(email)) {
      errors.push({ message: "E-mail is invalid" });
    }

    if (passwordInvalid) errors.push({ message: "Password too short" });

    if (errors.length > 0) {
      const error = new Error("Invalid Input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User exists already");
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({ email, name, password: hashedPw });

    const createdUser = await user.save();
    const { _id, _doc } = createdUser;
    return { ..._doc, _id: _id.toString() };
  },

  login: async ({ email, password }) => {
    const { JWT_SECRET } = process.env;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.code = 422;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect");
      err.code = 422;
      throw error;
    }

    const { _id } = user;
    const userId = _id.toString();
    const token = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token, userId };
  },
};
