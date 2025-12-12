import { useState } from "react";
import truckEU from "../assets/truckWireFrameEU.jpg";
import truckUS from "../assets/truckWireFrameUS.jpg";

const InteractiveTruckCanvas = ({ configuration, partsData, onPartClick }) => {
  const isUS = configuration === "6x4";
  const backgroundImage = isUS ? truckUS : truckEU;

  const getColor = (status) => {
    switch (status) {
      case "critical":
        return "rgba(239, 68, 68, 0.6)";
      case "warning":
        return "rgba(234, 179, 8, 0.6)";
      case "good":
        return "rgba(34, 197, 94, 0.6)";
      default:
        return "rgba(107, 114, 128, 0.3)";
    }
  };

  const zonesEU = [
    {
      id: "engine",
      label: "Engine",
      x: 19,
      y: 40,
      w: 12,
      h: 20,
      type: "component",
    },
    {
      id: "transmission",
      label: "Transmission",
      x: 32,
      y: 42,
      w: 16,
      h: 15,
      type: "component",
    },
    {
      id: "battery",
      label: "Battery Box",
      x: 45,
      y: 23,
      w: 8,
      h: 12,
      type: "component",
    },
    {
      id: "fuel_tank",
      label: "Fuel System",
      x: 55,
      y: 60,
      w: 15,
      h: 15,
      type: "fluid",
    },
    {
      id: "front_left",
      label: "Front Left",
      x: 29,
      y: 22,
      w: 13,
      h: 10,
      type: "tire",
    },
    {
      id: "front_right",
      label: "Front Right",
      x: 29,
      y: 66,
      w: 13,
      h: 10,
      type: "tire",
    },
    {
      id: "rear_left_outer",
      label: "Rear Left Outer",
      x: 80,
      y: 23,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "rear_left_inner",
      label: "Rear Left Inner",
      x: 80,
      y: 31,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "rear_right_inner",
      label: "Rear Right Inner",
      x: 80,
      y: 60,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "rear_right_outer",
      label: "Rear Right Outer",
      x: 80,
      y: 68,
      w: 13,
      h: 7,
      type: "tire",
    },
  ];

  const zonesUS = [
    {
      id: "engine",
      label: "Engine",
      x: 15,
      y: 38,
      w: 13,
      h: 25,
      type: "component",
    },
    {
      id: "transmission",
      label: "Transmission",
      x: 29,
      y: 43,
      w: 15,
      h: 15,
      type: "component",
    },
    {
      id: "battery",
      label: "Battery Box",
      x: 45,
      y: 66,
      w: 8,
      h: 10,
      type: "component",
    },
    {
      id: "fuel_tank",
      label: "Fuel System",
      x: 48,
      y: 20,
      w: 15,
      h: 15,
      type: "fluid",
    },
    {
      id: "front_left",
      label: "Front Left",
      x: 14,
      y: 15,
      w: 13,
      h: 10,
      type: "tire",
    },
    {
      id: "front_right",
      label: "Front Right",
      x: 14,
      y: 74,
      w: 13,
      h: 10,
      type: "tire",
    },
    {
      id: "drive1_left_outer",
      label: "D1 Left Outer",
      x: 65,
      y: 16,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive1_left_inner",
      label: "D1 Left Inner",
      x: 65,
      y: 24,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive1_right_inner",
      label: "D1 Right Inner",
      x: 65,
      y: 67,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive1_right_outer",
      label: "D1 Right Outer",
      x: 65,
      y: 75,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive2_left_outer",
      label: "D2 Left Outer",
      x: 80,
      y: 16,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive2_left_inner",
      label: "D2 Left Inner",
      x: 80,
      y: 24,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive2_right_inner",
      label: "D2 Right Inner",
      x: 80,
      y: 67,
      w: 13,
      h: 7,
      type: "tire",
    },
    {
      id: "drive2_right_outer",
      label: "D2 Right Outer",
      x: 80,
      y: 75,
      w: 13,
      h: 7,
      type: "tire",
    },
  ];

  const zones = isUS ? zonesUS : zonesEU;

  return (
    <div className="relative w-full max-w-2xl mx-auto border border-gray-700 rounded-lg overflow-hidden bg-black">
      <img
        src={backgroundImage}
        alt="Truck Schematic"
        className="w-full h-auto block opacity-80"
      />

      <div className="absolute inset-0">
        {zones.map((zone) => {
          let status = "good";

          if (zone.type === "tire") {
            const tire = partsData.tires?.find((t) => t.position === zone.id);
            if (tire) status = tire.status;
          } else if (zone.type === "component") {
            const comp = partsData.components?.find((c) =>
              c.name.toLowerCase().includes(zone.id),
            );
            if (comp) {
              if (comp.healthStatus < 50) status = "critical";
              else if (comp.healthStatus < 80) status = "warning";
            }
          } else if (zone.type === "fluid") {
            if (partsData.status === "maintenance") status = "warning";
          }

          return (
            <div
              key={zone.id + zone.x}
              onClick={() => onPartClick(zone)}
              className="absolute cursor-pointer hover:border-2 hover:border-white transition-all duration-200 flex items-center justify-center group"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.w}%`,
                height: `${zone.h}%`,
                backgroundColor: getColor(status),
                borderRadius: "2px",
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none border border-gray-600 shadow-xl">
                {zone.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveTruckCanvas;
