const ObjectId = require("mongodb").ObjectId;
const { getDb } = require("../util/database");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
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

  addToCart(product) {
    // const cartProduct = this.cart.items.findIndex(
    //   (cp) => cp._id === product._id
    // );
    const updatedCart = {
      items: [{ productId: new ObjectId(product._id), quantity: 1 }],
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
}

module.exports = User;
