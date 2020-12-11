const jwt = require("jsonwebtoken");

const notAuthenticated = (msg) => {
  const error = new Error(msg);
  error.statusCode = 401;
  throw error;
};

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    notAuthenticated("Not Authenticated");
  }
  const [, token] = req.get("Authorization").split(" ");
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if (!decodedToken) {
    notAuthenticated("Not authenticated");
  }

  req.userId = decodedToken.userId;
  next();
};
