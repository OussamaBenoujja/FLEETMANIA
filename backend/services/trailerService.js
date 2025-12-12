const Trailer = require("../models/TrailerModel");

const trailerService = {
  async createTrailer(data) {
    const existing = await Trailer.findOne({ plate: data.plate });
    if (existing) throw new Error("Trailer with this plate already exists");
    return await Trailer.create(data);
  },

  async getAllTrailers() {
    return await Trailer.find().sort({ createdAt: -1 });
  },

  async getTrailerById(id) {
    const trailer = await Trailer.findById(id);
    if (!trailer) throw new Error("Trailer not found");
    return trailer;
  },

  async updateTrailer(id, data) {
    const trailer = await Trailer.findByIdAndUpdate(id, data, { new: true });
    if (!trailer) throw new Error("Trailer not found");
    return trailer;
  },

  async deleteTrailer(id) {
    const trailer = await Trailer.findById(id);
    if (!trailer) throw new Error("Trailer not found");
    if (trailer.status === "attached")
      throw new Error("Cannot delete trailer while attached to a trip");

    await Trailer.findByIdAndDelete(id);
    return { message: "Trailer deleted" };
  },
};

module.exports = trailerService;
