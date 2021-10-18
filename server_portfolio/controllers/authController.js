const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 60 * 60 * 1000
    ),
    httpOnly: true,

    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

exports.signup = asyncHandler(async (req, res) => {
  const {
    firstname,
    lastname,
    address,
    birthdate,
    email,
    username,
    password,
    passwordConfirm,
  } = req.body;
  const newUser = await User.create({
    firstName: firstname,
    lastName: lastname,
    address: address,
    birthdate: birthdate,
    email: email,
    username: username,
    password: password,
    passwordConfirm: passwordConfirm,
  });

  res.status(200).json({
    status: "success",
    data: newUser,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Please provide a username and password", 400));
  }

  const user = await User.findOne({ username: username }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("Incorrect username or password", 401));
  }

  if (!user.isActive) {
    return next(
      new AppError(
        "Your account is not activated yet! please check your email!"
      )
    );
  }

  createAndSendToken(user, 200, req, res);
});

exports.logout = asyncHandler(async (res) => {
  res.cookie("jwt"),
    "loggedOut",
    {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    };

  res.status(200).json({
    status: "success",
  });
});
