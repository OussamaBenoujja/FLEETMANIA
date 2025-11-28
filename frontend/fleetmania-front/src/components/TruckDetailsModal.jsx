import { useState, useEffect } from "react";
import Button from "./ui/Button";
import InteractiveTruckCanvas from "./InteractiveTruckCanvas";
import api from "../api/axios";

// --- ASSET IMPORTS ---
import engineIcon from "../assets/engine-motor-svgrepo-com.svg";
import transmissionIcon from "../assets/transmission-svgrepo-com.svg";
import tireIcon from "../assets/tire-wheel-svgrepo-com.svg";
import fuelIcon from "../assets/jerry-can-lubricant-petrol-can-svgrepo-com.svg";
import oilIcon from "../assets/engine-oil-svgrepo-com.svg";

// --- ICON HELPER ---
const getIcon = (type) => {
  switch (type) {
    case "engine":
      return engineIcon;
    case "transmission":
      return transmissionIcon;
    case "battery":
      return engineIcon;
    case "tire":
      return tireIcon;
    case "fluid":
      return fuelIcon;
    default:
      return engineIcon;
  }
};

const TruckDetailsModal = ({ truck, onClose }) => {
  if (!truck) return null;

  const [currentTruck, setCurrentTruck] = useState(truck);
  const [selectedPart, setSelectedPart] = useState({
    type: "overview",
    label: "Vehicle Overview",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [associatedFluids, setAssociatedFluids] = useState([]);

  // NEW: Tab State for Overview (Stats vs Notes)
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    setCurrentTruck(truck);
  }, [truck]);

  const handlePartClick = (zone) => {
    setIsEditing(false);
    let data = null;
    let relatedFluids = [];

    if (zone.type === "tire") {
      data = currentTruck.tires.find((t) => t.position === zone.id);
    } else if (zone.type === "component") {
      data = currentTruck.components.find((c) =>
        c.name.toLowerCase().includes(zone.id),
      );
      if (zone.id === "engine")
        relatedFluids = currentTruck.fluids.filter(
          (f) => f.type === "Engine Oil" || f.type === "Coolant",
        );
      else if (zone.id === "transmission")
        relatedFluids = currentTruck.fluids.filter(
          (f) => f.type === "Transmission Fluid",
        );
    } else if (zone.type === "fluid") {
      data = currentTruck.fluids.find((f) => f.type === "Diesel");
    }

    // Use JSON parse/stringify to deep copy nested telemetry objects so edits don't mutate state directly before save
    setSelectedPart({
      type: zone.type,
      label: zone.label,
      id: zone.id,
      data: data || {},
    });
    setEditData(data ? JSON.parse(JSON.stringify(data)) : {});
    setAssociatedFluids(relatedFluids);
  };

  const handleSavePart = async () => {
    try {
      const updatedTruck = { ...currentTruck };

      // Update Logic
      if (selectedPart.type === "tire") {
        const index = updatedTruck.tires.findIndex(
          (t) => t.position === selectedPart.id,
        );
        if (index !== -1)
          updatedTruck.tires[index] = {
            ...updatedTruck.tires[index],
            ...editData,
          };
      } else if (selectedPart.type === "component") {
        const index = updatedTruck.components.findIndex((c) =>
          c.name.toLowerCase().includes(selectedPart.id),
        );
        if (index !== -1)
          updatedTruck.components[index] = {
            ...updatedTruck.components[index],
            ...editData,
          };
      } else if (selectedPart.type === "fluid") {
        const index = updatedTruck.fluids.findIndex(
          (f) => f.type === editData.type,
        );
        if (index !== -1)
          updatedTruck.fluids[index] = {
            ...updatedTruck.fluids[index],
            ...editData,
          };
      }

      await api.patch(`/trucks/${currentTruck._id}`, {
        tires: updatedTruck.tires,
        components: updatedTruck.components,
        fluids: updatedTruck.fluids,
      });

      setCurrentTruck(updatedTruck);
      setSelectedPart((prev) => ({ ...prev, data: editData }));
      setIsEditing(false);
      alert("Technical Data Updated");
    } catch (err) {
      alert("Update Failed");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl w-full max-w-6xl h-[90vh] border border-gray-700 shadow-2xl flex overflow-hidden">
        {/* LEFT: CANVAS */}
        <div className="w-2/3 bg-black/50 p-8 border-r border-gray-700 relative flex flex-col">
          <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">
            Diagnostic View
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl transform scale-100 hover:scale-[1.02] transition-transform duration-500">
              <InteractiveTruckCanvas
                configuration={currentTruck.configuration || "4x2"}
                partsData={currentTruck}
                onPartClick={handlePartClick}
              />
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4 animate-pulse text-center">
            Click a highlighted zone to inspect details
          </p>
        </div>

        {/* RIGHT: DATA PANEL */}
        <div className="w-1/3 bg-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-700 bg-gray-900/50">
            <h2 className="text-2xl font-black text-white">
              {currentTruck.plate}
            </h2>
            <div className="flex justify-between items-center mt-2">
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-mono">
                {currentTruck.model}
              </span>
              <span className="text-yellow-500 font-mono font-bold">
                {currentTruck.currentMileage.toLocaleString()} km
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {/* 1. OVERVIEW (With Global Notes) */}
            {selectedPart.type === "overview" && (
              <div className="h-full flex flex-col">
                <div className="flex border-b border-gray-700 mb-6">
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`flex-1 pb-2 font-bold transition-colors ${activeTab === "stats" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    System Status
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`flex-1 pb-2 font-bold transition-colors ${activeTab === "notes" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    Driver Notes
                  </button>
                </div>

                {activeTab === "stats" ? (
                  <div className="text-center pt-10 opacity-75">
                    <img
                      src={engineIcon}
                      className="w-20 h-20 mx-auto opacity-50 mb-4 invert"
                      alt="System"
                    />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Select a Component
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Click on the Engine, Transmission, Tires, or Fuel Tank in
                      the diagram to manage detailed technical specs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentTruck.driverNotes?.length === 0 ? (
                      <p className="text-gray-500 italic text-center mt-10">
                        No notes recorded yet.
                      </p>
                    ) : (
                      currentTruck.driverNotes
                        ?.slice()
                        .reverse()
                        .map((note, i) => (
                          <div
                            key={i}
                            className="bg-gray-900 p-4 rounded border border-gray-700"
                          >
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                              <span className="font-bold text-yellow-500">
                                {note.author}
                              </span>
                              <span>
                                {new Date(note.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              "{note.text}"
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. COMPONENT (Engine, Trans) */}
            {selectedPart.type === "component" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={getIcon(selectedPart.id)}
                      alt={selectedPart.label}
                      className="w-12 h-12 invert opacity-80"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white capitalize">
                        {selectedPart.label}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase">
                        SN: {selectedPart.data.serialNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-yellow-500 text-xs font-bold hover:underline bg-yellow-500/10 px-3 py-1 rounded"
                    >
                      UPDATE SPECS
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="bg-gray-900 p-4 rounded border border-yellow-500/50 space-y-4">
                    {/* Specific Telemetry Fields */}
                    {selectedPart.id === "engine" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase block mb-1">
                            Oil Pressure (PSI)
                          </label>
                          <input
                            type="number"
                            value={editData.telemetry?.oilPressure || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                telemetry: {
                                  ...editData.telemetry,
                                  oilPressure: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase block mb-1">
                            Coolant Temp (°C)
                          </label>
                          <input
                            type="number"
                            value={editData.telemetry?.coolantTemp || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                telemetry: {
                                  ...editData.telemetry,
                                  coolantTemp: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {selectedPart.id === "transmission" && (
                      <div>
                        <label className="text-xs text-gray-400 uppercase block mb-1">
                          Clutch Wear (%)
                        </label>
                        <input
                          type="number"
                          value={editData.telemetry?.clutchWear || 0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              telemetry: {
                                ...editData.telemetry,
                                clutchWear: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                        />
                      </div>
                    )}

                    {/* Generic Health & Note */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase block mb-1">
                        Overall Health (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editData.healthStatus}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            healthStatus: Number(e.target.value),
                          })
                        }
                        className="w-full accent-yellow-500"
                      />
                      <div className="text-right text-xs text-yellow-500 font-bold">
                        {editData.healthStatus}%
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase block mb-1">
                        Technical Notes
                      </label>
                      <textarea
                        value={editData.notes || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 h-20 text-sm focus:border-yellow-500 outline-none"
                        placeholder="Log technical observations..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSavePart}
                        className="bg-green-600 text-xs py-2"
                      >
                        Save Updates
                      </Button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 text-xs px-4 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Read-Only Telemetry Display */}
                    {selectedPart.id === "engine" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 p-3 rounded border border-gray-700">
                          <div className="text-xs text-gray-500 uppercase font-bold">
                            Oil Pressure
                          </div>
                          <div className="text-xl text-white font-mono">
                            {selectedPart.data.telemetry?.oilPressure || "--"}{" "}
                            <span className="text-sm text-gray-500">PSI</span>
                          </div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded border border-gray-700">
                          <div className="text-xs text-gray-500 uppercase font-bold">
                            Coolant Temp
                          </div>
                          <div className="text-xl text-white font-mono">
                            {selectedPart.data.telemetry?.coolantTemp || "--"}{" "}
                            <span className="text-sm text-gray-500">°C</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedPart.id === "transmission" && (
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="text-xs text-gray-500 uppercase font-bold">
                          Clutch Wear
                        </div>
                        <div
                          className={`text-xl font-mono ${selectedPart.data.telemetry?.clutchWear > 50 ? "text-red-500" : "text-green-500"}`}
                        >
                          {selectedPart.data.telemetry?.clutchWear || 0}%
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded border border-gray-600 bg-gray-900/50 flex justify-between items-center">
                      <span className="text-gray-400 text-sm font-bold uppercase">
                        Health Score
                      </span>
                      <span
                        className={`text-2xl font-black ${selectedPart.data.healthStatus < 50 ? "text-red-500" : "text-green-500"}`}
                      >
                        {selectedPart.data.healthStatus}%
                      </span>
                    </div>

                    {/* Show Linked Fluids */}
                    {associatedFluids.length > 0 && (
                      <div className="bg-gray-900/30 p-4 rounded border border-gray-700">
                        <h4 className="text-xs text-gray-400 uppercase font-bold mb-3 flex items-center gap-2">
                          <img
                            src={oilIcon}
                            className="w-4 h-4 invert opacity-70"
                          />{" "}
                          Related Fluids
                        </h4>
                        <div className="space-y-3">
                          {associatedFluids.map((f, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>{f.type}</span>
                                <span
                                  className={`font-mono font-bold ${f.currentLiters / f.capacityLiters < 0.2 ? "text-red-500" : "text-green-500"}`}
                                >
                                  {f.currentLiters}L{" "}
                                  <span className="text-gray-600 font-normal">
                                    / {f.capacityLiters}L
                                  </span>
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${f.currentLiters / f.capacityLiters < 0.2 ? "bg-red-500" : "bg-green-500"}`}
                                  style={{
                                    width: `${(f.currentLiters / f.capacityLiters) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPart.data.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-xs text-gray-500 uppercase block mb-1 font-bold">
                          Technical Remarks
                        </span>
                        <p className="text-sm text-gray-300 italic bg-gray-900 p-3 rounded border border-gray-700">
                          "{selectedPart.data.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. TIRE DETAILS (Existing Logic) */}
            {selectedPart.type === "tire" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={tireIcon}
                      alt="Tire"
                      className="w-12 h-12 invert opacity-80"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedPart.label}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase">
                        {editData.brand}
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-yellow-500 text-xs font-bold hover:underline bg-yellow-500/10 px-3 py-1 rounded"
                    >
                      ADJUST
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 bg-gray-900 p-4 rounded border border-yellow-500/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 uppercase block mb-1">
                          PSI
                        </label>
                        <input
                          type="number"
                          value={editData.currentPressurePsi}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              currentPressurePsi: Number(e.target.value),
                            })
                          }
                          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase block mb-1">
                          Temp °C
                        </label>
                        <input
                          type="number"
                          value={editData.temperature}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              temperature: Number(e.target.value),
                            })
                          }
                          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase block mb-1">
                        Wear %
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editData.currentWear}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          let status = "good";
                          if (val > 80) status = "critical";
                          else if (val > 50) status = "warning";
                          setEditData({
                            ...editData,
                            currentWear: val,
                            status: status,
                          });
                        }}
                        className="w-full accent-yellow-500"
                      />
                      <div className="text-right text-xs text-yellow-500 font-bold">
                        {editData.currentWear}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSavePart}
                        className="bg-green-600 text-xs py-2"
                      >
                        Save
                      </Button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 text-xs px-4 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                      <div className="text-xs text-gray-500 uppercase font-bold">
                        Pressure
                      </div>
                      <div className="text-xl font-mono text-white">
                        {selectedPart.data.currentPressurePsi}{" "}
                        <span className="text-sm text-gray-500">PSI</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                      <div className="text-xs text-gray-500 uppercase font-bold">
                        Wear
                      </div>
                      <div
                        className={`text-xl font-mono ${selectedPart.data.currentWear > 50 ? "text-red-500" : "text-green-500"}`}
                      >
                        {selectedPart.data.currentWear}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. FLUID (Fuel/Diesel) - LITERS */}
            {selectedPart.type === "fluid" && (
              <div className="space-y-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={fuelIcon}
                      alt="Fuel"
                      className="w-12 h-12 invert opacity-80"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Fuel System
                      </h3>
                      <p className="text-xs text-gray-400 uppercase">
                        Primary Tank
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-yellow-500 text-xs font-bold hover:underline bg-yellow-500/10 px-3 py-1 rounded"
                    >
                      MANAGE FUEL
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="bg-gray-900 p-4 rounded border border-yellow-500/50 space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase block mb-1">
                        Current Level (L)
                      </label>
                      <input
                        type="number"
                        value={editData.currentLiters}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            currentLiters: Number(e.target.value),
                          })
                        }
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase block mb-1">
                        Tank Capacity (L)
                      </label>
                      <input
                        type="number"
                        value={editData.capacityLiters}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            capacityLiters: Number(e.target.value),
                          })
                        }
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSavePart}
                        className="bg-green-600 text-xs py-2"
                      >
                        Update
                      </Button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 p-6 rounded border border-gray-600 text-center">
                    <div className="text-4xl font-mono font-bold text-white mb-1">
                      {selectedPart.data.currentLiters}{" "}
                      <span className="text-lg text-gray-500">L</span>
                    </div>
                    <div className="text-xs text-gray-400 uppercase mb-4">
                      of {selectedPart.data.capacityLiters} Liters Capacity
                    </div>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                      <div
                        className={`h-full ${selectedPart.data.currentLiters / selectedPart.data.capacityLiters < 0.2 ? "bg-red-500" : "bg-yellow-500"}`}
                        style={{
                          width: `${(selectedPart.data.currentLiters / selectedPart.data.capacityLiters) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-700">
            <Button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white w-full"
            >
              Close Diagnostics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckDetailsModal;
