const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/userModel");

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });

exports.checkLoggedUser = asyncHandler(async (req, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cokkies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get accesss!", 401)
    );
  }

  const verifiedToken = await verifyToken(token);

  const loggedUser = await User.findById(verifiedToken.id);

  if (!loggedUser) {
    return next(
      new AppError("User belonging to this token does not exist!", 401)
    );
  }

  req.user = loggedUser;
  next();
});

exports.routeGuard =
  (...roles) =>
  (req, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You don not have permission to perform this action!",
          403
        )
      );
    }
    next();
  };
