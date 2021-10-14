const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = require("./app");

dotenv.config();

process.on("uncaughtException", (err) => {
  console.log("Unhandled exception! Application shutting down!");
  console.log(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;
const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("MongoDB connection successfull!");
  })
  .catch((err) => {
    console.log(`Error found! Error: ${err}`);
  });

const server = app.listen(PORT, () => {
  console.log(`Application running on Express.js on port ${PORT}!`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection! Application shutting down!`);
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
