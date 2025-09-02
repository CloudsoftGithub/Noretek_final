// src/app/cali_meter_dashboard/layout.jsx
"use client";

import { Inter } from "next/font/google";
import { useEffect } from "react";
import "./admin.css"; // Make sure this file exists in the same directory

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}