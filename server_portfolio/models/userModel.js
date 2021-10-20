const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validate = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please tell us your first name!"],
  },
  lastName: {
    type: String,
    required: [true, "please tell us your last name!"],
  },
  address: {
    type: String,
    required: [true, "Please tell us your address!"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email!"],
    unique: true,
    lowercase: true,
    validate: [validate.isEmail, "The email must be a valid email!"],
  },
  username: {
    type: String,
    unique: true,
    required: [true, "A user must have a username"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Please input your password!"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same!",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "owner"],
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT));
  this.passwordConfirm = undefined;
  next();
});

userSchema.method.isPasswordCorrect = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
