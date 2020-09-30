const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) =>
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        isAuthenticated: req.isLoggedIn,
        path: "/products",
      })
    )
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const { productId: prodId } = req.params;

  Product.findById(prodId.trim())
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) =>
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.isLoggedIn,
      })
    )
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const { productId: prodId } = req.body;
  Product.findById(prodId.trim())
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId: prodId } = req.body;
  req.user
    .removeFromCart(prodId)
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((item) => ({
        quantity: item.quantity,
        product: { ...item.productId._doc },
      }));
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
    isAuthenticated: req.isLoggedIn,
  });
};
