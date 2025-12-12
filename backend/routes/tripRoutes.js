const express = require("express");
const router = express.Router();
const tripService = require("../services/tripService");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const result = await tripService.getTrips(
      req.user.id,
      req.user.role,
      req.query.page,
      req.query.limit,
      req.query.sortBy,
      req.query.order,
      req.query.search,
      req.query.status,
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    res.json(trip);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await tripService.deleteTrip(req.params.id);
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
