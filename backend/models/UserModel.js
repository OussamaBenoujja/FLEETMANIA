const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: "default-avatar.png",
    },
    role: {
      type: String,
      enum: ["admin", "driver"],
      default: "driver",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
