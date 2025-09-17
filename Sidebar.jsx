import React, { useState } from "react";
import { ShieldAlert, Users, Activity, Info } from "lucide-react";

const navItems = [
  {
    label: "Alerts",
    icon: ShieldAlert,
    key: "alerts",
    tooltip: "View flagged activities and anomalies",
  },
  {
    label: "User Profiles",
    icon: Users,
    key: "profiles",
    tooltip: "Investigate user activity and risk",
    onClick: (setSelectedUser) => setSelectedUser("user123"),
  },
  {
    label: "Timeline",
    icon: Activity,
    key: "timeline",
    tooltip: "See chronological events and anomalies",
  },
];

// Additional feature: Quick Info section for SOC teams
const quickInfo = [
  {
    icon: Info,
    text: "Monitor file access, login times, and app usage for threats.",
  },
  {
    icon: ShieldAlert,
    text: "Anomalies detected using Isolation Forest & Autoencoder.",
  },
];

export default function Sidebar({ setSelectedUser }) {
  const [active, setActive] = useState("alerts");
  const [showInfo, setShowInfo] = useState(false);

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 shadow-2xl p-6 hidden md:flex flex-col transition-all duration-300"
      style={{ paddingTop: "5.5rem" }} // Add space for navbar height (adjust as needed)
    >
      <h2 className="text-2xl font-bold text-white mb-8 tracking-wide animate-fade-in">
        Insider Threat Dashboard
      </h2>
      <nav className="flex flex-col gap-4 mb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <div className="relative group" key={item.key}>
              <button
                onClick={() => {
                  setActive(item.key);
                  item.onClick && item.onClick(setSelectedUser);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg scale-105"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105"
                  }
                  focus:outline-none focus:ring-2 focus:ring-red-500
                  animate-slide-in
                `}
              >
                <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                <span className="font-medium text-lg">{item.label}</span>
              </button>
              {/* Tooltip feature */}
              <span className="absolute left-full top-1 ml-2 px-3 py-1 bg-gray-900 text-gray-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 w-48">
                {item.tooltip}
              </span>
            </div>
          );
        })}
      </nav>
      {/* Additional Quick Info section */}
      <div className="mt-auto">
        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-pink-700 hover:text-white transition-all font-semibold mb-2"
          onClick={() => setShowInfo((v) => !v)}
        >
          <Info className="w-5 h-5" />
          Quick Info
        </button>
        {showInfo && (
          <div className="bg-gray-900 rounded-xl p-3 shadow-lg animate-fade-in">
            {quickInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <div key={idx} className="flex items-center gap-2 mb-2 text-sm text-gray-200">
                  <Icon className="w-4 h-4 text-pink-400" />
                  {info.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease;
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(-20px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in {
            animation: slide-in 0.6s cubic-bezier(.4,0,.2,1);
          }
        `}
      </style>
    </aside>
  );
}