// src/app/layout.jsx
"use client";
import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import { useEffect } from "react";

// Import Bootstrap CSS here instead of in CSS files
import "bootstrap/dist/css/bootstrap.min.css";




export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Electricity Token Purchase System" />

        {/* Bootstrap Icons CDN */}

      </head>
      <body >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}