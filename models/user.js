const ObjectId = require("mongodb").ObjectId;
const { getDb } = require("../util/database");

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .find({ _id: new ObjectId(userId.trim()) })
      .next()
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => console.log(err));
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
}

module.exports = User;
