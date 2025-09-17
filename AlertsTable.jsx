import React, { useState } from "react";

// Updated mock alerts data with new users and XGBoost method
const mockAlerts = [
  {
    id: 1,
    user: "pushya",
    event: "Mass Download",
    risk: 95,
    method: "Isolation Forest",
    time: "2025-09-17 09:12",
    details: "Unusually large file transfer detected. Review user activity.",
    isNew: true,
  },
  {
    id: 2,
    user: "akhil",
    event: "Off-hours Login",
    risk: 82,
    method: "Autoencoder",
    time: "2025-09-17 22:30",
    details: "Login outside normal working hours. Possible credential misuse.",
    isNew: false,
  },
  {
    id: 3,
    user: "bhaavya",
    event: "Privilege Escalation",
    risk: 70,
    method: "Isolation Forest",
    time: "2025-09-16 14:05",
    details: "User gained elevated permissions. Check for policy violation.",
    isNew: false,
  },
  {
    id: 4,
    user: "ajay",
    event: "Suspicious File Access",
    risk: 88,
    method: "XGBoost",
    time: "2025-09-17 11:45",
    details: "Accessed sensitive files unusually. Monitor closely.",
    isNew: true,
  },
  {
    id: 5,
    user: "vishnu",
    event: "Multiple Failed Logins",
    risk: 60,
    method: "XGBoost",
    time: "2025-09-17 08:20",
    details: "Several failed login attempts detected. Possible brute-force attack.",
    isNew: false,
  },
  {
    id: 6,
    user: "hitesh",
    event: "Unusual Data Upload",
    risk: 92,
    method: "XGBoost",
    time: "2025-09-17 15:10",
    details: "Large upload of sensitive data. Immediate review needed.",
    isNew: true,
  },
];

export default function AlertsTable() {
  const [search, setSearch] = useState("");

  // Filter alerts by user or event
  const filteredAlerts = mockAlerts.filter(
    (a) =>
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.event.toLowerCase().includes(search.toLowerCase())
  );

  // Export alerts as CSV
  const exportAlerts = () => {
    const header = "User,Event,Risk Score,Detection Method,Time\n";
    const rows = filteredAlerts
      .map(
        (a) =>
          `${a.user},${a.event},${a.risk},${a.method},${a.time}`
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.download = "alerts.csv";
    aTag.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl p-6 mb-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search user or event..."
          className="px-3 py-2 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-900 transition-all font-semibold"
          onClick={exportAlerts}
        >
          Export Alerts
        </button>
      </div>
      <h3 className="text-xl font-semibold text-white mb-4 tracking-wide animate-slide-in">
        Alerts (sorted by risk score)
      </h3>
      <table className="w-full text-sm text-left rounded-xl overflow-hidden text-white">
        <thead className="bg-gray-800 text-white border-b border-gray-700">
          <tr>
            <th className="py-3 px-2">User</th>
            <th className="py-3 px-2">Event</th>
            <th className="py-3 px-2">Risk Score</th>
            <th className="py-3 px-2">Severity</th>
            <th className="py-3 px-2">Detection Method</th>
            <th className="py-3 px-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlerts.map((a) => (
            <tr
              key={a.id}
              className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-900 hover:text-white animate-row-fade relative"
            >
              <td className="py-3 px-2">
                {a.user}
                {a.isNew && (
                  <span className="ml-2 px-2 py-1 bg-pink-600 text-white text-xs rounded-full animate-pulse">
                    New
                  </span>
                )}
              </td>
              <td className="py-3 px-2 relative group">
                {a.event}
                <span className="absolute left-0 top-full mt-1 w-56 bg-gray-900 text-white text-xs rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {a.details}
                </span>
              </td>
              <td className="py-3 px-2 font-bold text-red-400 group-hover:text-white animate-pulse">
                {a.risk}
              </td>
              <td className="py-3 px-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold
                    ${
                      a.risk > 90
                        ? "bg-red-600 text-white"
                        : a.risk > 80
                        ? "bg-yellow-500 text-gray-900"
                        : "bg-green-600 text-white"
                    }
                  `}
                >
                  {a.risk > 90
                    ? "Critical"
                    : a.risk > 80
                    ? "High"
                    : "Medium"}
                </span>
              </td>
              <td className="py-3 px-2">{a.method}</td>
              <td className="py-3 px-2">{a.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
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