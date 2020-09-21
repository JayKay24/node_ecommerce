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
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    updatedCartItems;

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((item) => item.productId);

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find(
              (i) => i.productId.toString() === product._id.toString()
            ).quantity,
          };
        });
      });
  }

  deleteItemFromCart(prodId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== prodId.toString()
    );
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id.trim()) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: { _id: new ObjectId(this._id), name: this.name },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      })
      .catch((err) => console.log(err));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new ObjectId(this._id) })
      .toArray();
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
}

module.exports = User;
