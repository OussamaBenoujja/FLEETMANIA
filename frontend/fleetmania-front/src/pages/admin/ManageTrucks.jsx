import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import TruckDetailsModal from "../../components/TruckDetailsModal";

const ManageTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [selectedTruck, setSelectedTruck] = useState(null);

  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    currentMileage: "",
    configuration: "4x2", // Default to EU
    status: "available",
    photo: null,
  });
  const [error, setError] = useState("");

  const fetchTrucks = async () => {
    try {
      const { data } = await api.get("/trucks?limit=100");
      setTrucks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleEditClick = (e, truck) => {
    e.stopPropagation();
    setEditMode(true);
    setCurrentId(truck._id);
    setFormData({
      plate: truck.plate,
      model: truck.model,
      currentMileage: truck.currentMileage,
      configuration: truck.configuration || "4x2", // Load existing config
      status: truck.status,
      photo: null,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this truck permanently?")) return;
    try {
      await api.delete(`/trucks/${id}`);
      setTrucks(trucks.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete truck");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = new FormData();
    data.append("plate", formData.plate);
    data.append("model", formData.model);
    data.append("currentMileage", formData.currentMileage);
    data.append("configuration", formData.configuration); // Send config to backend
    data.append("status", formData.status);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      if (editMode) {
        await api.patch(`/trucks/${currentId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/trucks", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowForm(false);
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        plate: "",
        model: "",
        currentMileage: "",
        configuration: "4x2",
        status: "available",
        photo: null,
      });
      fetchTrucks();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500 text-black";
      case "on_trip":
        return "bg-blue-500 text-white";
      case "maintenance":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              FLEET <span className="text-yellow-500">TRUCKS</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Monitor and maintain your vehicles
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditMode(false);
              setFormData({
                plate: "",
                model: "",
                currentMileage: "",
                configuration: "4x2",
                status: "available",
                photo: null,
              });
            }}
            className="bg-yellow-500 text-black px-6 py-3 rounded font-bold hover:bg-yellow-400 transition shadow-lg flex items-center gap-2"
          >
            {showForm ? "✕ Close" : "+ Add Truck"}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl mb-10 border border-gray-700 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editMode ? "Edit Vehicle Details" : "Register New Truck"}
            </h2>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    License Plate
                  </label>
                  <input
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none uppercase font-mono tracking-widest"
                    name="plate"
                    value={formData.plate}
                    onChange={handleInputChange}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    Vehicle Model
                  </label>
                  <input
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Volvo FH16"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    Current Mileage (km)
                  </label>
                  <input
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                    type="number"
                    name="currentMileage"
                    value={formData.currentMileage}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* NEW CONFIGURATION DROPDOWN */}
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    Configuration Type
                  </label>
                  <select
                    name="configuration"
                    value={formData.configuration}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                  >
                    <option value="4x2">EU Standard (4x2 / 6-Wheeler)</option>
                    <option value="6x4">US Standard (6x4 / 10-Wheeler)</option>
                  </select>
                </div>

                {editMode && (
                  <div>
                    <label className="text-gray-400 text-sm font-bold uppercase">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="on_trip">On Trip</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center items-center bg-gray-900/50 rounded border-2 border-dashed border-gray-700 hover:border-yellow-500 transition p-6">
                <label className="cursor-pointer text-center">
                  <span className="block text-gray-400 mb-2">
                    Upload Truck Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                  />
                </label>
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-4 rounded hover:bg-gray-200 transition"
                >
                  {editMode ? "SAVE CHANGES" : "ADD VEHICLE"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map((truck) => (
            <div
              key={truck._id}
              onClick={() => setSelectedTruck(truck)}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-yellow-500 transition-colors group flex flex-col cursor-pointer relative"
            >
              <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                Click for Full Report
              </div>

              <div className="h-48 bg-gray-900 relative">
                <img
                  src={`http://localhost:3045${truck.photo}`}
                  alt={truck.plate}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/600x400/1f2937/fbbf24?text=TRUCK";
                  }}
                />
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded font-bold text-xs uppercase tracking-wider ${getStatusColor(truck.status)}`}
                >
                  {truck.status.replace("_", " ")}
                </div>
              </div>

              <div className="p-6 flex-1">
                <h3 className="text-2xl font-black text-white font-mono">
                  {truck.plate}
                </h3>
                <p className="text-gray-400 text-lg mb-4">{truck.model}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-500 text-sm font-mono">
                    <span className="bg-gray-900 px-2 py-1 rounded text-yellow-500 mr-2">
                      KM
                    </span>
                    {truck.currentMileage.toLocaleString()} km
                  </div>
                  {/* Tiny badge showing config */}
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {truck.configuration}
                  </span>
                </div>
              </div>

              <div className="flex border-t border-gray-700">
                <button
                  onClick={(e) => handleEditClick(e, truck)}
                  className="flex-1 py-4 text-sm font-bold text-yellow-500 hover:bg-gray-700 transition border-r border-gray-700"
                >
                  EDIT
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, truck._id)}
                  className="flex-1 py-4 text-sm font-bold text-red-500 hover:bg-gray-700 transition"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>

        <TruckDetailsModal
          truck={selectedTruck}
          onClose={() => setSelectedTruck(null)}
        />
      </div>
    </div>
  );
};

export default ManageTrucks;
