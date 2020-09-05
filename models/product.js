// const fs = require("fs");
// const path = require("path");
const db = require("../util/database");
const Cart = require("./cart");

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   "data",
//   "products.json"
// );

// const getProductsFromFile = (cb) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    id && (this.id = id.trim());
    this.title = title.trim();
    this.imageUrl = imageUrl.trim();
    this.description = description.trim();
    this.price = +price;
  }

  save() {
    return db.execute(
      `INSERT INTO products (title, price , imageUrl, description) values (?, ?, ?, ?)`,
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  // static fetchAll(cb) {
  static fetchAll() {
    // getProductsFromFile(cb);
    return db.execute("SELECT * FROM products");
  }

  // static findById(id, cb) {
  static findById(id) {
    // getProductsFromFile((products) => {
    //   const product = products.find((p) => p.id === id);
    //   cb(product);
    // });
  }

  static deleteById(id) {
    //   id = id.trim();
    //   getProductsFromFile((products) => {
    //     const product = products.find((p) => p.id === id);
    //     const updatedProducts = products.filter((p) => p.id !== id);
    //     fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
    //       if (!err) {
    //         Cart.deleteProduct(id, product.price);
    //       }
    //     });
    //   });
  }
};
