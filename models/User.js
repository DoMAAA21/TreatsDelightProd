const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");



const userSchema = new mongoose.Schema({
  fname: {
    type: String,

    required: [true, "Please enter your name"],

    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  lname: {
    type: String,

    required: [true, "Please enter your name"],

    maxLength: [30, "Your name cannot exceed 30 characters"],
  },

  email: {
    type: String,

    required: [true, "Please enter your email"],

    unique: true,

    validate: [validator.isEmail, "Please enter valid email address"],
  },

  password: {
    type: String,

    required: [true, "Please enter your password"],

    minlength: [6, "Your password must be longer than 6 characters"],

    select: false,
  },

  avatar: {
    public_id: {
      type: String,

      required: true,
    },

    url: {
      type: String,

      required: true,

      default: "https://res.cloudinary.com/djttinjoh/image/upload/v1693557587/defaultavatar_pwre4e.png",
    },
  },
  course: {
    type: String,
    required: false,
  },
  religion: {
    type: String,
    required: true,
  },

  role: {
    type: String,

    default: "User",
  },
  health: {
    diabetic: {
      type: Boolean,
      default: false,
      required: false
    },
    hypertension: {
      type: Boolean,
      default: false,
      required: false
    },
    kidneyProblem: {
      type: Boolean,
      default: false,
      required: false
    },
    cardiovascular: {
      type: Boolean,
      default: false,
      required: false
    },
    obese: {
      type: Boolean,
      default: false,
      required: false
    },
    heartDisease: {
      type: Boolean,
      default: false,
      required: false
    },
    none: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  googleId: {
    type: String,
    required: false,
  },
  store: {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Store'
    },

    name: {
      type: String,

      required: false,
    }
  },

  createdAt: {
    type: Date,

    default: Date.now,
  },

  resetPasswordToken: String,

  resetPasswordExpire: Date,
});

// uncomment to test bcrypt

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre('updateOne', async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, name: this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // Generate token

  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire time

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};


module.exports = mongoose.model("User", userSchema);


