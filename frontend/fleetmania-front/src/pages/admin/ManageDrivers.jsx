import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ManageDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: null,
  });
  const [error, setError] = useState("");

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get("/users/drivers");
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleEditClick = (driver) => {
    setEditMode(true);
    setCurrentId(driver._id);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: "",
      photo: null,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to fire this driver?")) return;
    try {
      await api.delete(`/users/driver/${id}`);
      setDrivers(drivers.filter((d) => d._id !== id));
    } catch (err) {
      alert("Failed to delete driver");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      if (editMode) {
        await api.patch(`/users/driver/${currentId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/users/driver", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowForm(false);
      setEditMode(false);
      setCurrentId(null);
      setFormData({ name: "", email: "", password: "", photo: null });
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    // 1. MAIN BACKGROUND: Dark Gray (Almost Black)
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              DRIVER <span className="text-yellow-500">ROSTER</span>
            </h1>
            <p className="text-gray-400 mt-1">Manage your fleet personnel</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditMode(false);
              setFormData({ name: "", email: "", password: "", photo: null });
            }}
            className="bg-yellow-500 text-black px-6 py-3 rounded font-bold hover:bg-yellow-400 transition shadow-lg flex items-center gap-2"
          >
            {showForm ? "✕ Close" : "+ Add Driver"}
          </button>
        </div>

        {/* DARK FORM */}
        {showForm && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl mb-10 border border-gray-700 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editMode ? "Edit Profile" : "Onboard New Driver"}
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
              {/* Custom Dark Inputs would go here, using standard ones for now but styling wrapper */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    Full Name
                  </label>
                  <input
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-bold uppercase">
                    {editMode ? "New Password (Optional)" : "Password"}
                  </label>
                  <input
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editMode}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center items-center bg-gray-900/50 rounded border-2 border-dashed border-gray-700 hover:border-yellow-500 transition p-6">
                <label className="cursor-pointer text-center">
                  <span className="block text-gray-400 mb-2">
                    Upload Profile Photo
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
                  {editMode ? "SAVE CHANGES" : "CONFIRM REGISTRATION"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DARK GRID CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-yellow-500 transition-colors group"
            >
              <div className="p-6 flex items-center space-x-4">
                <img
                  src={`http://localhost:3045${driver.photo}`}
                  alt={driver.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500 bg-gray-700"
                  onError={(e) => {
                    e.target.src =
                      "https://ui-avatars.com/api/?name=" +
                      driver.name +
                      "&background=fbbf24&color=000";
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {driver.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{driver.email}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-green-400 font-bold uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS ROW */}
              <div className="flex border-t border-gray-700">
                <button
                  onClick={() => handleEditClick(driver)}
                  className="flex-1 py-3 text-sm font-bold text-yellow-500 hover:bg-gray-700 transition border-r border-gray-700"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDeleteClick(driver._id)}
                  className="flex-1 py-3 text-sm font-bold text-red-500 hover:bg-gray-700 transition"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}

          {drivers.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 text-gray-600">
              No drivers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDrivers;
