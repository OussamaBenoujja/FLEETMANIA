const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/driver",
  protect,
  adminOnly,
  upload.single("photo"),
  async (req, res) => {
    try {
      const driverData = {
        ...req.body,
        photo: req.file ? `/uploads/${req.file.filename}` : undefined,
      };
      const newDriver = await userService.createDriver(driverData);
      res.status(201).json(newDriver);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

router.get("/drivers", protect, adminOnly, async (req, res) => {
  try {
    const drivers = await userService.getAllDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch(
  "/driver/:id",
  protect,
  adminOnly,
  upload.single("photo"),
  async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.photo = `/uploads/${req.file.filename}`;
      }
      const updatedDriver = await userService.updateDriver(
        req.params.id,
        updateData,
      );
      res.json(updatedDriver);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

router.delete("/driver/:id", protect, adminOnly, async (req, res) => {
  try {
    await userService.deleteDriver(req.params.id);
    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
