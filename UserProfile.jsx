import React, { useState } from "react";
import { Info, Download, User } from "lucide-react";

// Try to import chart.js, fallback if not available
let LineChart;
try {
  const { Line } = require("react-chartjs-2");
  const {
    Chart: ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
  } = require("chart.js");

  ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);
  LineChart = Line;
} catch (err) {
  LineChart = null;
}

// Mock data for multiple users
const usersData = {
  pushya: {
    logins: 14,
    filesAccessed: 52,
    anomalies: [
      {
        type: "Mass Download",
        time: "2025-09-17 09:12",
        method: "Isolation Forest",
        details: "Unusually large file transfer detected.",
        severity: "critical",
      },
      {
        type: "Privilege Escalation",
        time: "2025-09-16 14:05",
        method: "Isolation Forest",
        details: "User gained elevated permissions.",
        severity: "high",
      },
    ],
    lastActive: "17:45",
    chart: [14, 18, 10, 7, 3],
  },
  akhil: {
    logins: 10,
    filesAccessed: 33,
    anomalies: [
      {
        type: "Off-hours Login",
        time: "2025-09-17 22:30",
        method: "Autoencoder",
        details: "Login outside normal working hours. Possible credential misuse.",
        severity: "high",
      },
    ],
    lastActive: "22:30",
    chart: [10, 12, 8, 6, 5],
  },
  bhaavya: {
    logins: 8,
    filesAccessed: 21,
    anomalies: [],
    lastActive: "15:10",
    chart: [8, 9, 7, 5, 4],
  },
  ajay: {
    logins: 13,
    filesAccessed: 40,
    anomalies: [
      {
        type: "Suspicious File Access",
        time: "2025-09-17 11:45",
        method: "XGBoost",
        details: "Accessed sensitive files unusually. Monitor closely.",
        severity: "high",
      },
    ],
    lastActive: "11:45",
    chart: [13, 15, 12, 9, 6],
  },
  vishnu: {
    logins: 6,
    filesAccessed: 15,
    anomalies: [
      {
        type: "Multiple Failed Logins",
        time: "2025-09-17 08:20",
        method: "XGBoost",
        details: "Several failed login attempts detected. Possible brute-force attack.",
        severity: "medium",
      },
    ],
    lastActive: "08:20",
    chart: [6, 7, 5, 4, 3],
  },
  hitesh: {
    logins: 11,
    filesAccessed: 29,
    anomalies: [
      {
        type: "Unusual Data Upload",
        time: "2025-09-17 15:10",
        method: "XGBoost",
        details: "Large upload of sensitive data. Immediate review needed.",
        severity: "critical",
      },
    ],
    lastActive: "15:10",
    chart: [11, 13, 9, 8, 7],
  },
};

// Utility to download user data as CSV
function downloadUserCSV(user, details) {
  let csv = `User,Logins,Files Accessed,Last Active\n`;
  csv += `${user},${details.logins},${details.filesAccessed},${details.lastActive}\n\n`;
  csv += `Anomaly Type,Time,Method,Details,Severity\n`;
  details.anomalies.forEach(a => {
    csv += `"${a.type}","${a.time}","${a.method}","${a.details}","${a.severity}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const aTag = document.createElement("a");
  aTag.href = url;
  aTag.download = `${user}_profile.csv`;
  aTag.click();
  window.URL.revokeObjectURL(url);
}

export default function UserProfile({ user }) {
  const [selectedUser, setSelectedUser] = useState(user || "pushya");
  const [showAnomalies, setShowAnomalies] = useState(false);

  const userDetails = usersData[selectedUser];

  // Chart data if available
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Activity (events/hour)",
        data: userDetails.chart,
        borderColor: "rgb(236,72,153)",
        backgroundColor: "rgba(236,72,153,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl p-6 animate-fade-in transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div>
          <h3 className="text-xl font-semibold text-white tracking-wide animate-slide-in mb-2">
            User Profile: <span className="text-pink-400">{selectedUser}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(usersData).map((uname) => (
              <button
                key={uname}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    selectedUser === uname
                      ? "bg-pink-600 text-white shadow"
                      : "bg-gray-800 text-gray-300 hover:bg-pink-700 hover:text-white"
                  }
                `}
                onClick={() => {
                  setSelectedUser(uname);
                  setShowAnomalies(false);
                }}
              >
                <User className="w-4 h-4" />
                {uname}
              </button>
            ))}
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition-all font-semibold shadow"
          onClick={() => downloadUserCSV(selectedUser, userDetails)}
        >
          <Download className="w-5 h-5" />
          Download CSV
        </button>
      </div>

      {LineChart ? (
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg animate-row-fade">
          <LineChart data={chartData} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:bg-pink-900 animate-row-fade">
            <p className="text-sm text-gray-400">Logins</p>
            <p className="text-xl font-bold text-white">{userDetails.logins}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:bg-pink-900 animate-row-fade">
            <p className="text-sm text-gray-400">Files Accessed</p>
            <p className="text-xl font-bold text-white">{userDetails.filesAccessed}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:bg-red-700 animate-row-fade">
            <p className="text-sm text-gray-400">Anomalies</p>
            <p className="text-xl font-bold text-red-400 animate-pulse">{userDetails.anomalies.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:bg-pink-900 animate-row-fade">
            <p className="text-sm text-gray-400">Last Active</p>
            <p className="text-xl font-bold text-white">{userDetails.lastActive}</p>
          </div>
        </div>
      )}

      {/* Additional Feature: Show anomaly details */}
      <div className="mt-6">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-pink-700 hover:text-white transition-all font-semibold mb-2"
          onClick={() => setShowAnomalies((v) => !v)}
        >
          <Info className="w-5 h-5" />
          {showAnomalies ? "Hide" : "Show"} Anomaly Details
        </button>
        {showAnomalies && (
          <div className="bg-gray-900 rounded-xl p-4 shadow-lg animate-fade-in">
            <h4 className="text-lg font-bold text-pink-400 mb-2">Anomaly Events</h4>
            {userDetails.anomalies.length === 0 ? (
              <div className="text-gray-400">No anomalies detected for this user.</div>
            ) : (
              userDetails.anomalies.map((anomaly, idx) => (
                <div
                  key={idx}
                  className="mb-3 p-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 shadow transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold
                        ${
                          anomaly.severity === "critical"
                            ? "bg-red-600 text-white"
                            : anomaly.severity === "high"
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-green-600 text-white"
                        }
                      `}
                    >
                      {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-800 text-pink-400 font-semibold shadow">
                      {anomaly.method}
                    </span>
                    <span className="ml-2 text-gray-400 font-mono">{anomaly.time}</span>
                  </div>
                  <div className="text-white font-semibold">{anomaly.type}</div>
                  <div className="text-gray-300 text-sm">{anomaly.details}</div>
                </div>
              ))
            )}
          </div>
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