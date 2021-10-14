// Built-in imports
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Library import
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

// Local Import
const AppError = require("./utils/appError")

var userRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: process.env.CLIENT_SIDE_URL }));
app.use(helmet());
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many request! Please try again in an hour',
 })

 if (process.env.NODE_ENV === "development") {
   app.use(morgan('dev'))
 }

 app.use(compression())

app.options("*", cors({ origin: process.env.CLIENT_SIDE_URL }));

app.enable("trust proxy");

app.use("/api", limiter);
app.use("/user", userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404))
})

app.use(errorMiddleware)

module.exports = app;
