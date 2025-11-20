const express = require("express");
const router = express.Router();
const trailerService = require("../services/trailerService");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const trailer = await trailerService.createTrailer(req.body);
    res.status(201).json(trailer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const trailers = await trailerService.getAllTrailers();
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const trailer = await trailerService.updateTrailer(req.params.id, req.body);
    res.json(trailer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await trailerService.deleteTrailer(req.params.id);
    res.json({ message: "Trailer deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
