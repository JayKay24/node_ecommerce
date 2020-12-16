const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");

const FeedController = require("../controllers/feed");

const validMongoIdStr = "5fd7d2445c9ef311e6fb7618";
const MONGO_DB_URL = "mongodb://localhost:27017/maxTest";

describe("Feed Controller", () => {
  before(async () => {
    await mongoose.connect(MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = new User({
      email: "test@test.com",
      password: "tester",
      name: "Test",
      posts: [],
      _id: validMongoIdStr,
    });
    await user.save();
  });

  after(async () => {
    await User.deleteMany({}).exec();
    await mongoose.disconnect();
  });

  describe("Create a post", () => {
    it("should add a created post to the post of the creator", async () => {
      const title = "Test Post";
      const content = "ewerferferfefre";

      const body = { title, content };
      const file = {
        path: "abc",
      };

      const req = { userId: validMongoIdStr, body, file };
      const res = {
        status: function () {
          return this;
        },
        json: function () {},
      };

      const savedUser = await FeedController.createPost(req, res, () => {});
      expect(savedUser).to.have.property("posts");
      expect(savedUser.posts).to.have.length(1);
    });
  });
});
