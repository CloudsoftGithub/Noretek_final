// src/app/cali_meter_dashboard/layout.jsx
"use client";

import { useEffect } from "react";
import "./admin.css";
// Import Bootstrap CSS here
import "bootstrap/dist/css/bootstrap.min.css";



export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  return (
    <html lang="en">
      <body >
        {children}
      </body>
    </html>
  );
}