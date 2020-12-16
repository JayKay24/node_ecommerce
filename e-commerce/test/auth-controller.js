const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");

const AuthController = require("../controllers/auth");

describe("Auth Controller", () => {
  before(async () => {
    const url = "mongodb://localhost:27017/maxTest";
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await User.deleteMany({}).exec();
    await mongoose.disconnect();
  });

  describe("Login", () => {
    it("should throw an error if accessing the database fails", async () => {
      sinon.stub(User, "findOne");
      User.findOne.throws();

      const req = {
        body: {
          email: "test@test.com",
          password: "tester",
        },
      };

      const result = await AuthController.login(req, {}, () => {});
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);

      User.findOne.restore();
    });
  });

  describe("Get User Status", () => {
    it("should send a response with a valid user status for an existing user", async () => {
      const validMongoIdStr = "5fd7d2445c9ef311e6fb7618";
      const user = new User({
        email: "test@test.com",
        password: "tester",
        name: "Test",
        posts: [],
        _id: validMongoIdStr,
      });
      await user.save();
      const req = { userId: validMongoIdStr };
      const res = {
        json: function (data) {
          this.userStatus = data.status;
        },
        statusCode: 500,
        userStatus: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
      };

      try {
        await AuthController.getUserStatus(req, res, () => {});
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal("I am new!");
      } catch (error) {
        console.log(error);
      }
    });
  });
});
