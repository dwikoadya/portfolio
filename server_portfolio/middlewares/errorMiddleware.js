const mongoose = require("mongoose");

const AppError = require("../utils/appError");

const sendErrorDevelopment = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res, req) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR ", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleJWTError = () =>
  new AppError(`Invalid token! Please login again!`, 401);

const handleJWTExpiredError = () =>
  new AppError(`Your token has expired! Please login again!`, 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}!`;
  return new AppError(message, 400);
};


const handleDuplicateFieldsDB = (err) => {
  const message = Object.keys(err.keyValue)
    .map(
      (key) =>
        `Value ${err.keyValue[key]} is already taken for field ${key}! Please use another value!`
    )
    .join(", ");
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let errorCopy = { ...err };
    errorCopy.message = err.message;

    if (err instanceof mongoose.Error.CastError) {
      errorCopy = handleCastErrorDB(errorCopy);
    }

    if (errorCopy.code === 11000) {
      errorCopy = handleDuplicateFieldsDB(errorCopy);
    }

    if (err instanceof mongoose.Error.ValidationError) {
      errorCopy = handleValidationErrorDB(errorCopy);
    }

    if (errorCopy.name === "JsonWebTokenError") {
      errorCopy = handleJWTError();
    }

    if (errorCopy.name === "TokenExpiredError") {
      errorCopy = handleJWTExpiredError();
    }

    sendErrorProduction(errorCopy, req, res);
  }
};
