const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/UserModel");
const Truck = require("./models/TruckModel");
const Trailer = require("./models/TrailerModel");
const Trip = require("./models/TripModel");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fleetmania_db";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const generateTruckData = (i) => {
  const positions = [
    "front_left", "front_right",
    "rear_left_outer", "rear_left_inner",
    "rear_right_outer", "rear_right_inner"
  ];

  const components = [
    { name: "Engine", healthStatus: 95, telemetry: { oilPressure: 45, coolantTemp: 90 } },
    { name: "Transmission", healthStatus: 92, telemetry: { clutchWear: 10 } },
    { name: "Brake System", healthStatus: 88 },
    { name: "Battery", healthStatus: 100, telemetry: { voltage: 24.5 } },
    { name: "Alternator", healthStatus: 90 },
    { name: "Cooling System", healthStatus: 96 }
  ];

  const fluids = [
    { type: "Engine Oil", currentLiters: 35, capacityLiters: 40 },
    { type: "Transmission Fluid", currentLiters: 18, capacityLiters: 20 },
    { type: "Coolant", currentLiters: 45, capacityLiters: 50 },
    { type: "AdBlue", currentLiters: 60, capacityLiters: 80 },
    { type: "Diesel", currentLiters: 400, capacityLiters: 800 }
  ];

  return {
    plate: `TRK-${1000 + i}`,
    model: i % 2 === 0 ? "Volvo FH16" : "Scania R500",
    vin: `VIN${1000000 + i}`,
    status: "available",
    currentMileage: 10000 + (i * 5000),
    configuration: "4x2",
    tires: positions.map(pos => ({
      position: pos,
      brand: "Michelin",
      currentPressurePsi: 100,
      currentWear: Math.floor(Math.random() * 20),
      status: "good"
    })),
    components: components,
    fluids: fluids
  };
};

const seedData = async () => {
  await connectDB();

  try {
    // 1. Clear Database
    await User.deleteMany({});
    await Truck.deleteMany({});
    await Trailer.deleteMany({});
    await Trip.deleteMany({});
    console.log("Old data cleared.");

    // 2. Create Admin
    await User.create({
      name: "Super Admin",
      email: "admin@fleet.com",
      password: "password123", // Model should hash this automatically
      role: "admin"
    });
    console.log("Admin created (admin@fleet.com / password123)");

    // 3. Create 10 Drivers
    const drivers = [];
    for (let i = 1; i <= 10; i++) {
      drivers.push({
        name: `Driver ${i}`,
        email: `driver${i}@fleet.com`,
        password: "password123",
        role: "driver"
      });
    }
    const createdDrivers = await User.insertMany(drivers);
    console.log("10 Drivers created.");

    // 4. Create 10 Trucks
    const trucks = [];
    for (let i = 1; i <= 10; i++) {
      trucks.push(generateTruckData(i));
    }
    const createdTrucks = await Truck.create(trucks); // Use create to trigger defaults if any
    console.log("10 Trucks created.");

    // 5. Create 10 Trailers
    const trailers = [];
    const types = ['Flatbed', 'Refrigerated', 'Container', 'Tanker'];
    for (let i = 1; i <= 10; i++) {
      trailers.push({
        plate: `TRL-${2000 + i}`,
        type: types[i % 4],
        maxLoad: 30000,
        status: "available"
      });
    }
    const createdTrailers = await Trailer.insertMany(trailers);
    console.log("10 Trailers created.");

    // 6. Create 10 Trips
    const trips = [];
    for (let i = 0; i < 10; i++) {
      trips.push({
        driver: createdDrivers[i]._id,
        truck: createdTrucks[i]._id,
        trailer: createdTrailers[i]._id,
        startLocation: "Warehouse A",
        endLocation: `Client Site ${i + 1}`,
        cargoType: "Electronics",
        cargoWeight: 15000,
        description: "Handle with care",
        status: i < 3 ? "in_progress" : "to_do",
        startMileage: createdTrucks[i].currentMileage,
        fuelConsumed: 0
      });

      // Update statuses if trip is active
      if (i < 3) {
        await Truck.findByIdAndUpdate(createdTrucks[i]._id, { status: "on_trip" });
        await Trailer.findByIdAndUpdate(createdTrailers[i]._id, { status: "attached" });
      }
    }
    await Trip.insertMany(trips);
    console.log("10 Trips created.");

    console.log("✅ SEEDING COMPLETE");
    process.exit();

  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
};

seedData();
