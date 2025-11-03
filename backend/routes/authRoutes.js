const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", async (req, res) => {
  try {
    const userData = await authService.registerUser(req.body);
    res.status(201).json(userData);
  } catch (error) {
    const status = error.message === "User already exists" ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const userData = await authService.loginUser(req.body);
    res.json(userData);
  } catch (error) {
    const status = error.message === "Invalid credentials" ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    console.log("ERROR in /me route:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
