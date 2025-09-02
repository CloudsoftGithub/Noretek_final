"use client";

import { SessionProvider } from "@/contexts/SessionContext";
import "./globals.css"; // Your CSS file with all the styles you provided
import { Inter } from "next/font/google";
import { useEffect } from "react";


const inter = Inter({ subsets: ["latin"] });

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
        <link rel="icon" href="/favicon.ico" />
        {/* You can add any other head tags here */}
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}