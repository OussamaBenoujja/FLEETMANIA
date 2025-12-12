const express = require("express");
const router = express.Router();
const truckService = require("../services/truckService");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("photo"),
  async (req, res) => {
    try {
      const truckData = {
        ...req.body,
        photo: req.file ? `/uploads/${req.file.filename}` : undefined,
      };
      const truck = await truckService.createTruck(truckData);
      res.status(201).json(truck);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const result = await truckService.getAllTrucks(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const truck = await truckService.getTruckById(req.params.id);
    res.json(truck);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.patch(
  "/:id",
  protect,
  adminOnly,
  upload.single("photo"),
  async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.photo = `/uploads/${req.file.filename}`;
      }
      const truck = await truckService.updateTruck(req.params.id, updateData);
      res.json(truck);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await truckService.deleteTruck(req.params.id);
    res.json({ message: "Truck deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:id/maintenance", protect, adminOnly, async (req, res) => {
  try {
    const truck = await truckService.addMaintenanceLog(req.params.id, req.body);
    res.json(truck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
