import { useState } from "react";
import InteractiveTruckCanvas from "../components/InteractiveTruckCanvas";
import Navbar from "../components/Navbar";

const TestInteractiveTruckZones = () => {
  const [config, setConfig] = useState("4x2"); // Default to EU
  const [lastClicked, setLastClicked] = useState(null);

  // MOCK DATA: Simulate a truck with some issues
  const mockTruckData = {
    configuration: config,
    // 1. TIRES (Some critical, some good)
    tires: [
      { position: "front_left", status: "good" },
      { position: "front_right", status: "critical" }, // Should be RED
      { position: "rear_left_outer", status: "warning" }, // Should be YELLOW
      { position: "rear_right_outer", status: "good" },
      // US Specific
      { position: "drive1_left_outer", status: "good" },
      { position: "drive1_right_outer", status: "critical" },
    ],
    // 2. COMPONENTS (Engine is failing)
    components: [
      { name: "Engine", healthStatus: 40 }, // Should be RED (< 50)
      { name: "Transmission", healthStatus: 90 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Canvas Calibration Lab</h1>

          {/* TOGGLE BUTTON */}
          <div className="flex gap-4">
            <button
              onClick={() => setConfig("4x2")}
              className={`px-6 py-2 rounded font-bold ${config === "4x2" ? "bg-yellow-500 text-black" : "bg-gray-700"}`}
            >
              EU (4x2)
            </button>
            <button
              onClick={() => setConfig("6x4")}
              className={`px-6 py-2 rounded font-bold ${config === "6x4" ? "bg-yellow-500 text-black" : "bg-gray-700"}`}
            >
              US (6x4)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: THE CANVAS */}
          <div className="lg:col-span-2 bg-gray-800 p-4 rounded-xl border border-gray-700">
            <InteractiveTruckCanvas
              configuration={config}
              partsData={mockTruckData}
              onPartClick={(part) => setLastClicked(part)}
            />
            <p className="text-center text-gray-500 mt-4 text-sm">
              Tip: Right-click &gt; Inspect on a box to adjust coordinates in
              real-time.
            </p>
          </div>

          {/* RIGHT: DEBUG PANEL */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">
              Debug Console
            </h3>

            <div className="mb-6">
              <h4 className="text-gray-400 text-sm uppercase font-bold mb-2">
                Current Config
              </h4>
              <div className="text-2xl font-mono text-yellow-500">{config}</div>
            </div>

            <div>
              <h4 className="text-gray-400 text-sm uppercase font-bold mb-2">
                Last Clicked Zone
              </h4>
              {lastClicked ? (
                <div className="bg-black p-4 rounded border border-green-500 font-mono text-sm">
                  <p>
                    <span className="text-gray-500">ID:</span>{" "}
                    <span className="text-white">{lastClicked.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Label:</span>{" "}
                    <span className="text-yellow-500">{lastClicked.label}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="text-blue-400">{lastClicked.type}</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Coordinates: {lastClicked.x}%, {lastClicked.y}%
                  </p>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Click a part on the truck...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInteractiveTruckZones;
