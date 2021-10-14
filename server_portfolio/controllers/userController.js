const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const factory = require("../utils/handlerFactory");
const User = require("../models/userModel");

const filterObj = (obj, ...allowFields) => {
  const newObject = {};

  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) {
      newObject[el] = obj[el];
    }
  });

  return newObject;
};

exports.getUser = factory.getOne(User);

exports.makeAdmin = asyncHandler(async (req, res) => {
  const modifiedUser = await User.findByIdAndUpdate(
    req.body.id,
    { role: "admin" },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: modifiedUser,
  });
});

exports.revokeAdmin = asyncHandler(async (req, res) => {
  const modifiedUser = await User.findByIdAndUpdate(
    req.body.id,
    { role: "user" },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: modifiedUser,
  });
});

exports.updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates! PLease use the /updatePassword route!`,
        400
      )
    );
  }

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "address",
    "email"
  );

  const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updateUser,
  });
});
