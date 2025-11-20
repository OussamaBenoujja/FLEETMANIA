const mongoose = require("mongoose");

const trailerSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      required: true,
      enum: ["Flatbed", "Refrigerated", "Container", "Tanker"],
    },
    maxLoad: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "attached", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trailer", trailerSchema);
