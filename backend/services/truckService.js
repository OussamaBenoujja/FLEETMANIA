const Truck = require("../models/TruckModel");

const truckService = {

  async createTruck(data) {
    const existingTruck = await Truck.findOne({ plate: data.plate });
    if (existingTruck) {
      throw new Error("Truck with this license plate already exists");
    }


    const defaultTireProps = {
      brand: "Michelin",
      status: "good",
      currentWear: 0,
      currentPressurePsi: 100,
      temperature: 25,
    };


    const tiresEU = [

      { position: "front_left", ...defaultTireProps },
      { position: "front_right", ...defaultTireProps },
      { position: "rear_left_outer", ...defaultTireProps },
      { position: "rear_left_inner", ...defaultTireProps },
      { position: "rear_right_outer", ...defaultTireProps },
      { position: "rear_right_inner", ...defaultTireProps },
    ];

    const tiresUS = [

      { position: "front_left", ...defaultTireProps },
      { position: "front_right", ...defaultTireProps },

      { position: "drive1_left_outer", ...defaultTireProps },
      { position: "drive1_left_inner", ...defaultTireProps },
      { position: "drive1_right_outer", ...defaultTireProps },
      { position: "drive1_right_inner", ...defaultTireProps },
      // Drive Axle 2
      { position: "drive2_left_outer", ...defaultTireProps },
      { position: "drive2_left_inner", ...defaultTireProps },
      { position: "drive2_right_outer", ...defaultTireProps },
      { position: "drive2_right_inner", ...defaultTireProps },
    ];


    const selectedTires = data.configuration === "6x4" ? tiresUS : tiresEU;


    const defaultComponents = [
      {
        name: "Engine",
        healthStatus: 100,
        telemetry: { oilPressure: 40, coolantTemp: 90 },
      },
      {
        name: "Transmission",
        healthStatus: 100,
        telemetry: { clutchWear: 0, vibrationLevel: "low" },
      },
      { name: "Brake System", healthStatus: 100 },
      { name: "Battery", healthStatus: 100, telemetry: { voltage: 24.2 } },
      { name: "Alternator", healthStatus: 100 },
      { name: "Cooling System", healthStatus: 100 },
    ];


    const defaultFluids = [
      {
        type: "Engine Oil",
        currentLiters: 35,
        capacityLiters: 40,
        qualityStatus: "clean",
      },
      {
        type: "Transmission Fluid",
        currentLiters: 18,
        capacityLiters: 20,
        qualityStatus: "clean",
      },
      {
        type: "Coolant",
        currentLiters: 45,
        capacityLiters: 50,
        qualityStatus: "clean",
      },
      {
        type: "AdBlue",
        currentLiters: 60,
        capacityLiters: 80,
        qualityStatus: "clean",
      },
      {
        type: "Diesel",
        currentLiters: 400,
        capacityLiters: 800,
        qualityStatus: "clean",
      }, // Big Tank
    ];


    const finalTruckData = {
      ...data,
      configuration: data.configuration || "4x2", // Ensure this is set
      tires: data.tires || selectedTires,
      components: data.components || defaultComponents,
      fluids: data.fluids || defaultFluids,
    };

    return await Truck.create(finalTruckData);
  },

  async getAllTrucks(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [trucks, total] = await Promise.all([
      Truck.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Truck.countDocuments(),
    ]);

    return {
      data: trucks,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getTruckById(id) {
    const truck = await Truck.findById(id);
    if (!truck) {
      throw new Error("Truck not found");
    }
    return truck;
  },

  async updateTruck(id, updateData) {
    const truck = await Truck.findByIdAndUpdate(id, updateData, { new: true });
    if (!truck) {
      throw new Error("Truck not found");
    }
    return truck;
  },

  async deleteTruck(id) {
    const truck = await Truck.findById(id);
    if (!truck) {
      throw new Error("Truck not found");
    }
    if (truck.status === "on_trip") {
      throw new Error("Cannot delete a truck while it is on a trip");
    }

    await Truck.findByIdAndDelete(id);
    return { message: "Truck deleted successfully" };
  },



  async addMaintenanceLog(id, logData) {
    const truck = await Truck.findById(id);
    if (!truck) throw new Error("Truck not found");

    truck.maintenanceHistory.push({
      type: logData.type,
      mileageAtService: truck.currentMileage,
      description: logData.description,
      cost: logData.cost,
      date: new Date(),
    });


    if (logData.type === "Oil Change") {
      const oil = truck.fluids.find((f) => f.type === "Engine Oil");
      if (oil) {
        oil.levelPercent = 100;
        oil.qualityStatus = "clean";
      }
    }

    await truck.save();
    return truck;
  },
};

module.exports = truckService;
