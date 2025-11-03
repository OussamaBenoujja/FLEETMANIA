const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");

const userService = {
  async createDriver({ name, email, password, photo }) {
    const userExists = await User.findOne({ email });
    if (userExists) throw new Error("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "driver",
      photo: photo || "default-avatar.png",
    });

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
    };
  },

  async getAllDrivers() {
    return await User.find({ role: "driver" }).select("-password");
  },

  async updateDriver(id, updateData) {

    const driver = await User.findById(id);
    if (!driver || driver.role !== "driver") {
      throw new Error("Driver not found");
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedDriver = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return updatedDriver;
  },

  async deleteDriver(id) {
    const driver = await User.findById(id);
    if (!driver || driver.role !== "driver") {
      throw new Error("Driver not found");
    }

    await User.findByIdAndDelete(id);
    return { message: "Driver deleted successfully" };
  },
};

module.exports = userService;
