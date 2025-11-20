const Trip = require("../models/TripModel");
const Truck = require("../models/TruckModel");
const User = require("../models/UserModel");
const Trailer = require("../models/TrailerModel");

const tripService = {
  async createTrip({
    driverId,
    truckId,
    trailerId,
    startLocation,
    endLocation,
    cargoType,
    cargoWeight,
    description,
  }) {
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      throw new Error("Invalid Driver selected");
    }

    const truck = await Truck.findById(truckId);
    if (!truck) throw new Error("Invalid Truck selected");
    if (truck.status !== "available")
      throw new Error(`Truck ${truck.plate} is currently ${truck.status}`);

    // --- NEW: TRAILER LOGIC ---
    let trailerDoc = null;
    if (trailerId) {
      trailerDoc = await Trailer.findById(trailerId);
      if (!trailerDoc) throw new Error("Invalid Trailer selected");
      if (trailerDoc.status !== "available")
        throw new Error(
          `Trailer ${trailerDoc.plate} is currently ${trailerDoc.status}`,
        );

      // Safety Check: Trailer Max Load
      if (Number(cargoWeight) > trailerDoc.maxLoad) {
        throw new Error(`OVERLOAD: Trailer limit is ${trailerDoc.maxLoad}kg`);
      }
    }

    const maxTruckLoad = truck.maintenanceRules?.maxLoadCapacity || 40000;
    if (Number(cargoWeight) > maxTruckLoad) {
      throw new Error(`OVERLOAD: Truck limit is ${maxTruckLoad}kg`);
    }

    const trip = await Trip.create({
      driver: driverId,
      truck: truckId,
      trailer: trailerId || null,
      startLocation,
      endLocation,
      cargoType,
      cargoWeight,
      description,
      status: "to_do",
      startMileage: truck.currentMileage,
    });

    truck.status = "on_trip";
    await truck.save();

    if (trailerDoc) {
      trailerDoc.status = "attached";
      await trailerDoc.save();
    }

    return trip;
  },

  async getTrips(
    userId,
    role,
    page = 1,
    limit = 10,
    sort = "createdAt",
    sortOrder = "desc",
    search = "",
    status,
  ) {
    let query = {};
    if (role === "driver") query = { driver: userId };
    if (status) query.status = status;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      try {
        const drivers = await User.find({ name: searchRegex }).select("_id");
        const trucks = await Truck.find({ plate: searchRegex }).select("_id");

        query.$or = [
          { startLocation: searchRegex },
          { endLocation: searchRegex },
          { cargoType: searchRegex },
          { driver: { $in: drivers.map((d) => d._id) } },
          { truck: { $in: trucks.map((t) => t._id) } },
        ];
      } catch (err) {}
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;
    const sortOptions = {};
    sortOptions[sort] = sortOrder === "asc" ? 1 : -1;

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate("driver", "name email")
        .populate("truck", "plate model currentMileage photo")
        .populate("trailer", "plate type")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Trip.countDocuments(query),
    ]);

    return {
      data: trips,
      meta: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    };
  },

  async getTripById(id) {
    const trip = await Trip.findById(id)
      .populate("driver")
      .populate("truck")
      .populate("trailer");
    if (!trip) throw new Error("Trip not found");
    return trip;
  },

  async updateTrip(tripId, updateData) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Trip not found");

    Object.assign(trip, updateData);
    await trip.save();

    if (updateData.status === "finished") {
      const truck = await Truck.findById(trip.truck);
      if (truck) {
        if (updateData.endMileage) {
          if (updateData.endMileage < trip.startMileage)
            throw new Error("End mileage error");
          truck.currentMileage = updateData.endMileage;
        }
        truck.status = "available";
        await truck.save();
      }

      if (trip.trailer) {
        const trailer = await Trailer.findById(trip.trailer);
        if (trailer) {
          trailer.status = "available";
          await trailer.save();
        }
      }
    }
    return trip;
  },

  async deleteTrip(id) {
    const trip = await Trip.findById(id);
    if (!trip) throw new Error("Trip not found");

    if (trip.status !== "finished") {
      const truck = await Truck.findById(trip.truck);
      if (truck) {
        truck.status = "available";
        await truck.save();
      }
      if (trip.trailer) {
        const trailer = await Trailer.findById(trip.trailer);
        if (trailer) {
          trailer.status = "available";
          await trailer.save();
        }
      }
    }

    await Trip.findByIdAndDelete(id);
    return { message: "Trip deleted successfully" };
  },
};

module.exports = tripService;
