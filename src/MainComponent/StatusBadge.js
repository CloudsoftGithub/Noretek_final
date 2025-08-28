"use client";
import React from "react";

const StatusBadge = ({ status }) => {
  let color = "bg-gray-300 text-gray-800";

  if (status === "Open") {
    color = "bg-blue-500 text-white";
  } else if (status === "In Progress") {
    color = "bg-orange-500 text-white";
  } else if (status === "Closed") {
    color = "bg-green-600 text-white";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}
    >
      {status || "N/A"}
    </span>
  );
};

export default StatusBadge;
