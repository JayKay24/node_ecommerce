const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = {
  createUser: async ({ userInput }, req) => {
    const { email, name, password } = userInput;
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
};