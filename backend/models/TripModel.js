const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    trailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trailer",
      default: null,
    },

    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },

    cargoType: { type: String, required: true },
    cargoWeight: { type: Number, required: true },
    description: { type: String },

    status: {
      type: String,
      enum: ["to_do", "in_progress", "finished"],
      default: "to_do",
    },

    startMileage: { type: Number, required: true },
    endMileage: { type: Number },
    fuelConsumed: { type: Number },
    vehicleIssues: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trip", tripSchema);
