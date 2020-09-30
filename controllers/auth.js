exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    isAuthenticated: req.isLoggedIn,
    pageTitle: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  req.isLoggedIn = true;
  res.redirect("/");
};
