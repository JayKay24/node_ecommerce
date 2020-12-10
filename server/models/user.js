const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, require: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = new mongoose.model("User", userSchema);