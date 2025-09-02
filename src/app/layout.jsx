"use client";
import { SessionProvider } from "@/contexts/SessionContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // ✅ load icons directly from node_modules

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  useEffect(() => {
    // Import Bootstrap JavaScript
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Electricity Token Purchase System" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
