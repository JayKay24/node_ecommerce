exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get("Cookie").trim().split("=")[1];

  res.render("auth/login", {
    path: "/login",
    isAuthenticated: isLoggedIn,
    pageTitle: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader("Set-Cookie", "loggedIn=true; Max-Age=10; HttpOnly");
  res.redirect("/");
};
