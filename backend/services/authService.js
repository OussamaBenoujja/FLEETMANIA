const User = require("../models/UserModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const authService = {
  //register
  async registerUser({ name, email, password, role }) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "driver",
    });

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };
  },

  //login
  async loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };
  },

  async getMe(userId) {
    const user = await User.findById(userId).select("-password");
    return user;
  },
};

module.exports = authService;
