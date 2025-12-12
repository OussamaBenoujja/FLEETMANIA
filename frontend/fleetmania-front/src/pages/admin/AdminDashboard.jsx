import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTrucks: 0,
    availableTrucks: 0,
    activeTrips: 0,
    driversOnRoad: 0,
    maintenanceAlerts: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [issues, setIssues] = useState([]);
  const [alerts, setAlerts] = useState([]); // NEW: Detailed Maintenance Alerts
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksRes, tripsRes] = await Promise.all([
          api.get("/trucks?limit=100"),
          api.get("/trips?limit=10&sortOrder=desc"),
        ]);

        const trucks = trucksRes.data.data;
        const trips = tripsRes.data.data;

        // --- 1. CALCULATE STATS ---
        const available = trucks.filter((t) => t.status === "available").length;
        const active = trips.filter((t) => t.status === "in_progress").length;

        // --- 2. GENERATE MAINTENANCE ALERTS (The "Brain") ---
        const maintenanceList = [];

        trucks.forEach((truck) => {
          let reasons = [];

          // Rule A: Mileage Check
          // Assuming we service every 20k km. In a real app, track 'lastServiceMileage'
          // For now, we simulate urgency if mileage is high
          if (
            truck.currentMileage % 20000 < 1000 &&
            truck.currentMileage > 1000
          ) {
            reasons.push(
              `Service Due (${truck.currentMileage.toLocaleString()} km)`,
            );
          }

          // Rule B: Critical Component Health
          const badComponent = truck.components?.find(
            (c) => c.healthStatus < 50,
          );
          if (badComponent) {
            reasons.push(
              `Critical: ${badComponent.name} (${badComponent.healthStatus}%)`,
            );
          }

          // Rule C: Tire Wear
          const badTire = truck.tires?.find((t) => t.currentWear > 80);
          if (badTire) {
            reasons.push(`Tire Replacement Needed (${badTire.position})`);
          }

          // If any issues found, add to alert list
          if (reasons.length > 0 || truck.status === "maintenance") {
            maintenanceList.push({ ...truck, reasons });
          }
        });

        // --- 3. REPORTED ISSUES (From Trips) ---
        const reportedIssues = trips.filter(
          (t) => t.vehicleIssues && t.vehicleIssues.length > 0,
        );

        setStats({
          totalTrucks: trucks.length,
          availableTrucks: available,
          activeTrips: active,
          driversOnRoad: active,
          maintenanceAlerts: maintenanceList.length,
        });

        setRecentTrips(trips.slice(0, 5));
        setIssues(reportedIssues);
        setAlerts(maintenanceList);
      } catch (err) {
        console.error("Dashboard Load Failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading Cockpit...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-black text-white mb-2">
          FLEET <span className="text-yellow-500">OVERVIEW</span>
        </h1>
        <p className="text-gray-400 mb-8">Real-time operational metrics</p>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500 shadow-lg">
            <div className="text-gray-400 text-sm font-bold uppercase">
              Active Missions
            </div>
            <div className="text-4xl font-black text-white mt-2">
              {stats.activeTrips}
            </div>
            <div className="text-xs text-blue-400 mt-2">
              Drivers currently on road
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500 shadow-lg">
            <div className="text-gray-400 text-sm font-bold uppercase">
              Available Trucks
            </div>
            <div className="text-4xl font-black text-white mt-2">
              {stats.availableTrucks}{" "}
              <span className="text-lg text-gray-500">
                / {stats.totalTrucks}
              </span>
            </div>
            <div className="text-xs text-green-400 mt-2">
              Ready for dispatch
            </div>
          </div>

          {/* Alert Card - Turns Red if alerts exist */}
          <div
            className={`bg-gray-800 p-6 rounded-xl border-l-4 shadow-lg ${stats.maintenanceAlerts > 0 ? "border-red-500 animate-pulse" : "border-gray-500"}`}
          >
            <div className="text-gray-400 text-sm font-bold uppercase">
              Maintenance Alerts
            </div>
            <div
              className={`text-4xl font-black mt-2 ${stats.maintenanceAlerts > 0 ? "text-red-500" : "text-white"}`}
            >
              {stats.maintenanceAlerts}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Requires immediate attention
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-yellow-500 shadow-lg">
            <div className="text-gray-400 text-sm font-bold uppercase">
              Recent Issues
            </div>
            <div className="text-4xl font-black text-white mt-2">
              {issues.length}
            </div>
            <div className="text-xs text-yellow-400 mt-2">
              Reported by drivers
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT: RECENT ACTIVITY --- */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-yellow-500 rounded"></span>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="flex justify-between items-center bg-gray-900/50 p-4 rounded border border-gray-700 hover:border-yellow-500/50 transition"
                >
                  <div>
                    <div className="text-white font-bold text-lg">
                      {trip.endLocation}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(trip.updatedAt).toLocaleDateString()} •{" "}
                      <span className="text-yellow-500">
                        {trip.driver?.name}
                      </span>{" "}
                      • {trip.truck?.plate}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider
                    ${
                      trip.status === "in_progress"
                        ? "bg-blue-900 text-blue-400 border border-blue-500/30"
                        : trip.status === "finished"
                          ? "bg-green-900 text-green-400 border border-green-500/30"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {trip.status.replace("_", " ")}
                  </span>
                </div>
              ))}
              {recentTrips.length === 0 && (
                <div className="text-gray-500 italic">
                  No activity recorded.
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: ALERTS PANEL (NEW) --- */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-red-500 rounded"></span>
              System Alerts
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-2 custom-scrollbar">
              {/* 1. Maintenance Alerts */}
              {alerts.map((truck) => (
                <div
                  key={truck._id}
                  className="bg-red-900/10 border border-red-500/50 p-4 rounded"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-bold font-mono">
                      {truck.plate}
                    </span>
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                      ACTION REQ
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-red-300">
                    {truck.reasons?.map((r, i) => <li key={i}>{r}</li>) || (
                      <li>Scheduled Maintenance</li>
                    )}
                  </ul>
                </div>
              ))}

              {/* 2. Driver Reports */}
              {issues.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-yellow-900/10 border border-yellow-500/50 p-4 rounded"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-bold font-mono">
                      {trip.truck?.plate}
                    </span>
                    <span className="text-xs text-yellow-500 uppercase">
                      Driver Report
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 italic mb-2">
                    "{trip.vehicleIssues}"
                  </p>
                  <div className="text-xs text-gray-500 text-right">
                    - {trip.driver?.name}
                  </div>
                </div>
              ))}

              {alerts.length === 0 && issues.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                  <span className="text-4xl mb-2 text-green-500/50">✓</span>
                  <p className="text-sm">All systems nominal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
