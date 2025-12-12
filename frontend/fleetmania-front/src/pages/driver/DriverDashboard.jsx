import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 1. Import the specific SVG
import truckLongIcon from "../../assets/truck-long.svg";

const DriverDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [finishData, setFinishData] = useState({
    endMileage: "",
    fuelConsumed: "",
    vehicleIssues: "",
  });
  const [error, setError] = useState("");

  const fetchMyTrips = async () => {
    try {
      const { data } = await api.get("/trips?limit=50");
      setTrips(data.data);
    } catch (err) {
      console.error("Failed to load trips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrips();
  }, []);

  // --- PDF GENERATOR ---
  const generateMissionOrder = (trip) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FLEETMANIA", 105, 20, null, null, "center");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("OFFICIAL MISSION ORDER", 105, 28, null, null, "center");

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Order Ref: #${trip._id.slice(-6).toUpperCase()}`, 15, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);

    // Tables
    autoTable(doc, {
      startY: 55,
      head: [["MISSION DETAILS", ""]],
      body: [
        ["Origin", trip.startLocation],
        ["Destination", trip.endLocation],
        ["Cargo", `${trip.cargoType} (${trip.cargoWeight} kg)`],
        ["Instructions", trip.description || "None"],
      ],
      theme: "grid",
      headStyles: { fillColor: [255, 200, 0], textColor: 0 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["RESOURCES", ""]],
      body: [
        ["Driver", trip.driver?.name],
        ["Vehicle", `${trip.truck?.plate} (${trip.truck?.model})`],
        ["Start Mileage", `${trip.startMileage} km`],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
    });

    // Signature Area
    const finalY = doc.lastAutoTable.finalY + 40;
    doc.line(20, finalY, 80, finalY);
    doc.text("Dispatcher", 20, finalY + 5);
    doc.line(130, finalY, 190, finalY);
    doc.text("Driver", 130, finalY + 5);

    doc.save(`Mission_${trip._id.slice(-6)}.pdf`);
  };

  // --- ACTIONS ---
  const handleStartTrip = async (id) => {
    if (!window.confirm("Confirm departure?")) return;
    try {
      await api.patch(`/trips/${id}`, { status: "in_progress" });
      fetchMyTrips();
    } catch (err) {
      alert("Error starting trip");
    }
  };

  const openFinishModal = (trip) => {
    setSelectedTrip(trip);
    setFinishData({
      endMileage: trip.truck?.currentMileage || "",
      fuelConsumed: "",
      vehicleIssues: "",
    });
    setShowFinishModal(true);
  };

  const handleFinishSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(finishData.endMileage) < Number(selectedTrip.startMileage)) {
      setError(
        `End mileage cannot be lower than start (${selectedTrip.startMileage} km).`,
      );
      return;
    }

    try {
      await api.patch(`/trips/${selectedTrip._id}`, {
        status: "finished",
        endMileage: finishData.endMileage,
        fuelConsumed: finishData.fuelConsumed,
        vehicleIssues: finishData.vehicleIssues,
      });
      setShowFinishModal(false);
      fetchMyTrips();
      alert("Mission Closed & Data Submitted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    }
  };

  const activeTrip = trips.find((t) => t.status === "in_progress");
  const pendingTrips = trips.filter((t) => t.status === "to_do");
  const historyTrips = trips.filter((t) => t.status === "finished");

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              DRIVER <span className="text-yellow-500">PORTAL</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage assignments</p>
          </div>
        </div>

        {/* 1. ACTIVE MISSION CARD */}
        {activeTrip ? (
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-1 rounded-xl shadow-2xl mb-12 animate-fade-in">
            <div className="bg-gray-900 rounded-lg p-6 md:p-8 relative overflow-hidden">
              {/* Background GO Text */}
              <div className="absolute top-0 right-0 opacity-10 text-9xl font-black text-white pointer-events-none transform translate-x-10 -translate-y-10">
                GO
              </div>

              <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs">
                      Current Mission
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-1 uppercase">
                    {activeTrip.endLocation}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    from{" "}
                    <span className="text-white">
                      {activeTrip.startLocation}
                    </span>
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-gray-700 min-w-[200px] flex flex-col items-center">
                  {/* ⚠️ REPLACED ICON HERE */}
                  <img
                    src={truckLongIcon}
                    alt="Truck"
                    className="h-10 w-auto mb-2 invert opacity-80"
                  />

                  <div className="text-2xl font-mono font-bold text-white">
                    {activeTrip.truck?.plate}
                  </div>
                  <div className="text-sm text-yellow-500">
                    {activeTrip.truck?.model}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t border-gray-800 pt-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Cargo</div>
                  <div className="font-bold text-white">
                    {activeTrip.cargoType}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Weight</div>
                  <div className="font-bold text-white">
                    {activeTrip.cargoWeight?.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">
                    Start Odometer
                  </div>
                  <div className="font-mono text-white">
                    {activeTrip.startMileage.toLocaleString()} km
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">
                    Est. Fuel
                  </div>
                  <div className="font-mono text-white">--</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => generateMissionOrder(activeTrip)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded border border-gray-600 transition flex items-center justify-center gap-2"
                >
                  📄 Download Order
                </button>
                {/* THIS BUTTON OPENS THE INPUT FORM */}
                <button
                  onClick={() => openFinishModal(activeTrip)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded shadow-lg shadow-green-900/20 transition flex items-center justify-center gap-2"
                >
                  🏁 Complete Mission & Enter Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 p-10 rounded-xl border border-gray-800 text-center mb-12 flex flex-col items-center justify-center">
            {/* ⚠️ REPLACED ICON HERE TOO */}
            <img
              src={truckLongIcon}
              alt="Idle"
              className="h-20 w-auto mb-6 invert opacity-30"
            />

            <h3 className="text-2xl font-bold text-white">No Active Mission</h3>
            <p className="text-gray-500">
              You are currently idle. Check upcoming jobs below.
            </p>
          </div>
        )}

        {/* 2. UPCOMING JOBS */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            UPCOMING
          </h3>
          <div className="grid gap-4">
            {pendingTrips.map((trip) => (
              <div
                key={trip._id}
                className="bg-gray-800 hover:bg-gray-750 p-6 rounded-lg border border-gray-700 transition flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded uppercase font-bold">
                      {trip.cargoType}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {trip.cargoWeight} kg
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">
                      {trip.startLocation}
                    </span>
                    <span className="text-gray-600">➔</span>
                    <span className="text-xl font-bold text-yellow-500">
                      {trip.endLocation}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Vehicle: {trip.truck?.plate}
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => generateMissionOrder(trip)}
                    className="flex-1 md:flex-none bg-black text-white px-4 py-3 rounded font-bold text-sm border border-gray-600 hover:border-white"
                  >
                    PDF
                  </button>
                  <button
                    disabled={!!activeTrip}
                    onClick={() => handleStartTrip(trip._id)}
                    className="flex-1 md:flex-none bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activeTrip ? "Finish Current" : "Start"}
                  </button>
                </div>
              </div>
            ))}
            {pendingTrips.length === 0 && !activeTrip && (
              <div className="text-gray-500 italic text-center p-6 bg-gray-900 rounded">
                No pending jobs.
              </div>
            )}
          </div>
        </div>

        {/* 3. HISTORY LOG */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            HISTORY
          </h3>
          <div className="space-y-1">
            {historyTrips.map((trip) => (
              <div
                key={trip._id}
                className="bg-gray-900/50 p-4 rounded flex justify-between items-center border-b border-gray-800 hover:bg-gray-800"
              >
                <div>
                  <span className="text-gray-300 font-bold mr-3">
                    {trip.endLocation}
                  </span>
                  <span className="text-gray-600 text-xs uppercase">
                    {new Date(trip.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-green-500 font-bold text-xs">
                    COMPLETED
                  </div>
                  <div className="text-gray-500 text-xs">
                    {trip.fuelConsumed ? `${trip.fuelConsumed}L Fuel` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINISH MISSION MODAL (Context Requirements) */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl animate-fade-in-up">
            <h2 className="text-2xl font-black text-white mb-1">
              MISSION REPORT
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter data to close this trip.
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleFinishSubmit} className="space-y-5">
              {/* Requirement: ARRIVAL MILEAGE */}
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
                  Final Odometer (km)
                </label>
                <input
                  type="number"
                  required
                  min={selectedTrip?.truck?.currentMileage}
                  value={finishData.endMileage}
                  onChange={(e) =>
                    setFinishData({ ...finishData, endMileage: e.target.value })
                  }
                  className="w-full bg-black border border-gray-600 text-white p-4 rounded text-xl font-mono focus:border-yellow-500 outline-none"
                  placeholder={selectedTrip?.truck?.currentMileage}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  Start: {selectedTrip?.truck?.currentMileage} km
                </div>
              </div>

              {/* Requirement: FUEL VOLUME */}
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
                  Total Fuel Consumed (Liters)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 150"
                  value={finishData.fuelConsumed}
                  onChange={(e) =>
                    setFinishData({
                      ...finishData,
                      fuelConsumed: e.target.value,
                    })
                  }
                  className="w-full bg-black border border-gray-600 text-white p-4 rounded text-xl font-mono focus:border-yellow-500 outline-none"
                />
              </div>

              {/* Requirement: VEHICLE CONDITION REMARKS */}
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
                  Vehicle Condition / Issues
                </label>
                <textarea
                  value={finishData.vehicleIssues}
                  onChange={(e) =>
                    setFinishData({
                      ...finishData,
                      vehicleIssues: e.target.value,
                    })
                  }
                  placeholder="e.g. Brakes squeaking, check engine light..."
                  className="w-full bg-black border border-gray-600 text-white p-3 rounded h-24 focus:border-yellow-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded text-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded text-sm shadow-lg"
                >
                  SUBMIT DATA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
