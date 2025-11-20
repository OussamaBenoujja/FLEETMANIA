const mongoose = require("mongoose");

const tireSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
    enum: [
      "front_left",
      "front_right",
      "rear_left_outer",
      "rear_left_inner",
      "rear_right_outer",
      "rear_right_inner",
      "drive1_left_outer",
      "drive1_left_inner",
      "drive1_right_outer",
      "drive1_right_inner",
      "drive2_left_outer",
      "drive2_left_inner",
      "drive2_right_outer",
      "drive2_right_inner",
    ],
  },
  brand: { type: String, default: "Michelin" },
  serialNumber: { type: String },
  currentPressurePsi: { type: Number, default: 100 },
  temperature: { type: Number, default: 25 },
  currentWear: { type: Number, default: 0, min: 0, max: 100 },
  installDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["good", "warning", "critical"],
    default: "good",
  },
});

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String },
  healthStatus: { type: Number, default: 100 },
  telemetry: {
    oilPressure: { type: Number },
    coolantTemp: { type: Number },
    clutchWear: { type: Number },
    voltage: { type: Number },
    vibrationLevel: { type: String, enum: ["low", "medium", "high"] },
  },
  installDate: { type: Date, default: Date.now },
  lastServicedAt: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
});

const fluidSchema = new mongoose.Schema({
  type: { type: String, required: true },
  currentLiters: { type: Number, default: 0 },
  capacityLiters: { type: Number, default: 20 },
  qualityStatus: {
    type: String,
    enum: ["clean", "degraded", "dirty"],
    default: "clean",
  },
  lastChangeDate: { type: Date, default: Date.now },
});

const trailerConnectionSchema = new mongoose.Schema({
  isConnected: { type: Boolean, default: false },
  trailerId: { type: String },
  type: { type: String, enum: ["Refrigerated", "Flatbed", "Tanker", "Box"] },
  cargoWeight: { type: Number, default: 0 },
  refrigerationTemp: { type: Number },
  brakeConnectionStatus: { type: Boolean, default: false },
  lightCheckStatus: { type: String, enum: ["pass", "fail"], default: "pass" },
});

const maintenanceRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, required: true },
  mileageAtService: { type: Number, required: true },
  description: { type: String },
  cost: { type: Number, default: 0 },
  garageName: { type: String },
  partsReplaced: [String],
});

const truckSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, unique: true, uppercase: true },
    model: { type: String, required: true },
    vin: { type: String },
    photo: { type: String, default: "no-photo.jpg" },

    configuration: {
      type: String,
      required: true,
      enum: ["4x2", "6x4"],
      default: "4x2",
    },

    status: {
      type: String,
      enum: ["available", "on_trip", "maintenance", "retired"],
      default: "available",
    },
    currentMileage: { type: Number, default: 0, required: true },
    engineHours: { type: Number, default: 0 },

    tires: [tireSchema],
    components: [componentSchema],
    fluids: [fluidSchema],
    trailer: trailerConnectionSchema,
    maintenanceHistory: [maintenanceRecordSchema],

    driverNotes: [
      {
        date: { type: Date, default: Date.now },
        author: { type: String },
        text: { type: String },
      },
    ],

    maintenanceRules: {
      serviceIntervalKm: { type: Number, default: 20000 },
      tireRotationIntervalKm: { type: Number, default: 50000 },
      maxLoadCapacity: { type: Number, default: 40000 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

truckSchema.virtual("healthScore").get(function () {
  let score = 100;

  if (this.currentMileage > 100000) {
    score -= Math.floor((this.currentMileage - 100000) / 10000);
  }

  if (this.tires && this.tires.length > 0) {
    const badTires = this.tires.filter((t) => t.currentWear > 80).length;
    score -= badTires * 10;
  }

  if (this.components && this.components.length > 0) {
    this.components.forEach((comp) => {
      if (comp.healthStatus < 50) score -= 15;
    });
  }

  return Math.max(0, score);
});

module.exports = mongoose.model("Truck", truckSchema);
