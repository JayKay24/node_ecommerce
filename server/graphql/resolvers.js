const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const { createPost } = require("../controllers/feed");

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

  login: async ({ email, password }, req) => {
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

  createPost: async ({ postInput: { title, content, imageUrl } }, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    const errors = [];
    const fieldIsInvalid = (field) =>
      validator.isEmpty(field) || !validator.isLength(field, { min: 5 });

    if (fieldIsInvalid(title)) {
      errors.push({ message: "Title is invalid" });
    }

    if (fieldIsInvalid(content)) {
      errors.push({ message: "Content is Invalid" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid Input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid Input");
      error.data = errors;
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title,
      content,
      imageUrl,
      creator: user,
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();

    // Add post to user's posts
    let { _doc, _id, createdAt, updatedAt } = createdPost;
    [_id, createdAt, updatedAt] = [
      _id.toString(),
      createdAt.toISOString(),
      updatedAt.toISOString(),
    ];

    return { ..._doc, createdAt, updatedAt, _id };
  },

  posts: async ({ page }, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    if (!page) {
      page = 1;
    }

    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    const transformedPosts = posts.map((p) => {
      return {
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return { posts: transformedPosts, totalPosts };
  },

  post: async ({ id }, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    let { _id, _doc, createdAt, updatedAt } = post;
    [_id, createdAt, updatedAt] = [
      _id.toString(),
      createdAt.toISOString(),
      updatedAt.toISOString(),
    ];
    return { ..._doc, _id, createdAt, updatedAt };
  },

  updatePost: async ({ id, postInput }, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    const {
      creator: { _id: postCreatorId },
    } = post;
    if (postCreatorId.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;
      throw error;
    }
    const errors = [];
    const fieldIsInvalid = (field) =>
      validator.isEmpty(field) || !validator.isLength(field, { min: 5 });

    const { title, content } = postInput;

    if (fieldIsInvalid(title)) {
      errors.push({ message: "Title is invalid" });
    }

    if (fieldIsInvalid(content)) {
      errors.push({ message: "Content is Invalid" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid Input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    post.title = title;
    post.content = content;

    if (postInput.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await post.save();
    let { _id, _doc, createdAt, updatedAt } = updatedPost;
    [_id, createdAt, updatedAt] = [
      _id.toString(),
      createdAt.toISOString(),
      updatedAt.toISOString(),
    ];

    return { ..._doc, _id, createdAt, updatedAt };
  },
};
