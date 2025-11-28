import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

const ManageTrips = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]); // New State

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [formData, setFormData] = useState({
    driverId: "",
    truckId: "",
    trailerId: "", // New Field
    startLocation: "",
    endLocation: "",
    cargoType: "",
    cargoWeight: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [driverRes, truckRes, trailerRes] = await Promise.all([
          api.get("/users/drivers"),
          api.get("/trucks?limit=100"),
          api.get("/trailers"),
        ]);
        setDrivers(driverRes.data);
        setTrucks(truckRes.data.data);
        setTrailers(trailerRes.data);
      } catch (err) {
        console.error("Failed to load resources");
      }
    };
    fetchResources();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let query = `/trips?page=${page}&limit=10&search=${search}&sortBy=createdAt&sortOrder=${sortOrder}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const { data } = await api.get(query);
      setTrips(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrips();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, sortOrder]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mission?")) return;
    try {
      await api.delete(`/trips/${id}`);
      fetchTrips();
    } catch (err) {
      alert("Failed to delete trip");
    }
  };

  const handleEdit = (trip) => {
    setEditMode(true);
    setCurrentId(trip._id);
    setFormData({
      driverId: trip.driver?._id || "",
      truckId: trip.truck?._id || "",
      trailerId: trip.trailer?._id || "",
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      cargoType: trip.cargoType || "",
      cargoWeight: trip.cargoWeight || "",
      description: trip.description,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cargoType || !formData.cargoWeight) {
      setError("Cargo Type and Weight are required.");
      return;
    }

    try {
      if (editMode) {
        await api.patch(`/trips/${currentId}`, formData);
        alert("Mission Updated!");
      } else {
        await api.post("/trips", formData);
        alert("New Mission Dispatched!");
      }

      setShowForm(false);
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        driverId: "",
        truckId: "",
        trailerId: "",
        startLocation: "",
        endLocation: "",
        cargoType: "",
        cargoWeight: "",
        description: "",
      });
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const availableTrucks = trucks.filter(
    (t) => t.status === "available" || (editMode && t._id === formData.truckId),
  );

  const availableTrailers = trailers.filter(
    (t) =>
      t.status === "available" || (editMode && t._id === formData.trailerId),
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-6 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              MISSION <span className="text-yellow-500">CONTROL</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Dispatcher Console</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="finished">Finished</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-white pl-4 pr-10 py-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
            />
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditMode(false);
                setFormData({
                  driverId: "",
                  truckId: "",
                  trailerId: "",
                  startLocation: "",
                  endLocation: "",
                  cargoType: "",
                  cargoWeight: "",
                  description: "",
                });
              }}
              className="bg-yellow-500 text-black px-6 py-2 rounded font-bold hover:bg-yellow-400 transition"
            >
              {showForm ? "✕ Close" : "+ New Mission"}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl mb-10 border-l-4 border-yellow-500">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editMode ? "Edit Mission" : "Dispatch New Mission"}
            </h2>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                  Driver
                </label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded"
                  required
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                  Truck
                </label>
                <select
                  name="truckId"
                  value={formData.truckId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded"
                  required
                >
                  <option value="">-- Select Truck --</option>
                  {availableTrucks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.plate} - {t.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                  Trailer (Optional)
                </label>
                <select
                  name="trailerId"
                  value={formData.trailerId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded"
                >
                  <option value="">-- No Trailer --</option>
                  {availableTrailers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.plate} - {t.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded border border-gray-700">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                    Origin
                  </label>
                  <input
                    name="startLocation"
                    value={formData.startLocation}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                    Destination
                  </label>
                  <input
                    name="endLocation"
                    value={formData.endLocation}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white p-2 rounded"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded border border-gray-700">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                    Cargo Type
                  </label>
                  <input
                    name="cargoType"
                    value={formData.cargoType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="cargoWeight"
                    value={formData.cargoWeight}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white p-2 rounded"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">
                  Manifest Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded h-20"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-4 rounded hover:bg-gray-200 transition"
                >
                  {editMode ? "Save Changes" : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-black text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Vehicle Config</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {trips.map((trip) => (
                <tr
                  key={trip._id}
                  className="hover:bg-gray-750 transition group"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${trip.status === "to_do" ? "bg-yellow-900/30 text-yellow-500 border-yellow-500/30" : ""} ${trip.status === "in_progress" ? "bg-blue-900/30 text-blue-400 border-blue-500/30 animate-pulse" : ""} ${trip.status === "finished" ? "bg-green-900/30 text-green-500 border-green-500/30" : ""}`}
                    >
                      {trip.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">
                      {trip.endLocation}
                    </div>
                    <div className="text-xs text-gray-500">
                      from {trip.startLocation}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {trip.cargoType}{" "}
                    <span className="text-xs text-gray-500">
                      ({trip.cargoWeight}kg)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-mono">
                      {trip.truck?.plate}
                    </div>
                    {trip.trailer && (
                      <div className="text-xs text-yellow-500 font-mono">
                        + {trip.trailer.plate} ({trip.trailer.type})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white">{trip.driver?.name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(trip)}
                        className="text-xs font-bold text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(trip._id)}
                        className="text-xs font-bold text-red-500 hover:text-red-400 border border-red-900 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 border-t border-gray-800 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-600 uppercase tracking-widest font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTrips;
