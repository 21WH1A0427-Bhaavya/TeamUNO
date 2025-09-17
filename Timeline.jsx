import React, { useState } from "react";
import { Info } from "lucide-react";

const mockEvents = [
  {
    time: "09:00",
    event: "Login",
    severity: "low",
    details: "Normal login during working hours.",
    method: "Baseline",
  },
  {
    time: "11:15",
    event: "File Download",
    severity: "medium",
    details: "Large file download detected.",
    method: "Isolation Forest",
  },
  {
    time: "22:30",
    event: "Off-hours Access",
    severity: "high",
    details: "Login outside normal hours. Possible credential misuse.",
    method: "Autoencoder",
  },
];

// Additional feature: filter by severity
const severityLevels = ["all", "low", "medium", "high"];

export default function Timeline() {
  const [filter, setFilter] = useState("all");

  const filteredEvents =
    filter === "all"
      ? mockEvents
      : mockEvents.filter((e) => e.severity === filter);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl p-6 mb-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h3 className="text-xl font-semibold text-white tracking-wide animate-slide-in">
          Suspicious Events Timeline
        </h3>
        <div className="flex gap-2">
          {severityLevels.map((level) => (
            <button
              key={level}
              className={`px-3 py-1 rounded-xl text-sm font-semibold transition-all duration-200
                ${
                  filter === level
                    ? "bg-pink-600 text-white shadow"
                    : "bg-gray-800 text-gray-300 hover:bg-pink-700 hover:text-white"
                }
              `}
              onClick={() => setFilter(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="relative border-l-2 border-gray-700 pl-6">
        {filteredEvents.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No events found for this filter.</div>
        ) : (
          filteredEvents.map((e, i) => (
            <div
              key={i}
              className="mb-8 relative group animate-row-fade transition-all duration-200"
            >
              <span
                className={`absolute -left-4 top-1 w-4 h-4 rounded-full border-2 border-white
                  ${
                    e.severity === "high"
                      ? "bg-red-500 animate-pulse"
                      : e.severity === "medium"
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }
                `}
              ></span>
              <p className="text-base text-gray-200 group-hover:text-white transition-colors duration-200 flex items-center gap-2">
                <span className="font-mono text-gray-400 group-hover:text-pink-300">{e.time}</span>
                {" – "}
                <span className="font-semibold">{e.event}</span>
                <span
                  className={`ml-3 px-2 py-0.5 rounded text-xs font-bold shadow
                    ${
                      e.severity === "high"
                        ? "bg-red-600 text-white"
                        : e.severity === "medium"
                        ? "bg-yellow-500 text-gray-900"
                        : "bg-green-600 text-white"
                    }
                  `}
                >
                  {e.severity}
                </span>
                <span
                  className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-800 text-pink-400 font-semibold shadow"
                  title={`Detected by ${e.method}`}
                >
                  {e.method}
                </span>
                <span className="relative group">
                  <Info className="w-4 h-4 ml-2 text-gray-400 hover:text-pink-400 cursor-pointer" />
                  <span className="absolute left-full top-0 ml-2 w-56 bg-gray-900 text-gray-200 text-xs rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {e.details}
                  </span>
                </span>
              </p>
            </div>
          ))
        )}
      </div>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(-20px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in {
            animation: slide-in 0.6s cubic-bezier(.4,0,.2,1);
          }
          @keyframes row-fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-row-fade {
            animation: row-fade 0.5s ease;
          }
        `}
      </style>
    </div>
  );
}