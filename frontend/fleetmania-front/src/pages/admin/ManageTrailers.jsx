import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

const ManageTrailers = () => {
  const [trailers, setTrailers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    plate: "",
    type: "Container",
    maxLoad: "",
    status: "available",
  });
  const [error, setError] = useState("");

  const fetchTrailers = async () => {
    try {
      const { data } = await api.get("/trailers");
      setTrailers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrailers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editMode) {
        await api.patch(`/trailers/${currentId}`, formData);
      } else {
        await api.post("/trailers", formData);
      }
      setShowForm(false);
      setFormData({
        plate: "",
        type: "Container",
        maxLoad: "",
        status: "available",
      });
      fetchTrailers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete trailer?")) return;
    try {
      await api.delete(`/trailers/${id}`);
      fetchTrailers();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-white">
            MANAGE <span className="text-yellow-500">TRAILERS</span>
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditMode(false);
            }}
            className="bg-yellow-500 text-black px-6 py-2 rounded font-bold hover:bg-yellow-400"
          >
            {showForm ? "Close" : "+ Add Trailer"}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg mb-8 border-l-4 border-yellow-500">
            {error && (
              <div className="bg-red-500 text-white p-2 rounded mb-4">
                {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-gray-400 text-sm font-bold uppercase mb-2">
                  Plate
                </label>
                <input
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
                  value={formData.plate}
                  onChange={(e) =>
                    setFormData({ ...formData, plate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold uppercase mb-2">
                  Type
                </label>
                <select
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option>Container</option>
                  <option>Flatbed</option>
                  <option>Refrigerated</option>
                  <option>Tanker</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold uppercase mb-2">
                  Max Load (kg)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
                  value={formData.maxLoad}
                  onChange={(e) =>
                    setFormData({ ...formData, maxLoad: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold uppercase mb-2">
                  Status
                </label>
                <select
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200"
                >
                  SAVE TRAILER
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trailers.map((t) => (
            <div
              key={t._id}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-yellow-500 transition relative"
            >
              <h3 className="text-xl font-bold text-white mb-1">{t.plate}</h3>
              <p className="text-yellow-500 text-sm uppercase font-bold mb-4">
                {t.type}
              </p>
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>Load: {t.maxLoad} kg</span>
                <span
                  className={
                    t.status === "available" ? "text-green-500" : "text-red-500"
                  }
                >
                  {t.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(true);
                    setCurrentId(t._id);
                    setFormData(t);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-gray-700 py-2 rounded text-white text-xs font-bold hover:bg-gray-600"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="flex-1 bg-red-900/30 text-red-500 py-2 rounded text-xs font-bold hover:bg-red-900/50"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageTrailers;
