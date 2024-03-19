const User = require("../models/User");

const jwt = require("jsonwebtoken");

const ErrorHandler = require("../utils/errorHandler");


exports.isAuthenticatedUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Login first to access this resource." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    } else {
      return res.status(401).json({ error: "Invalid token." });
    }
  }
};

exports.authorizeRoles = (...roles) => {

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to acccess this resource`,
          403
        )
      );
    }

    next();
  };
};
