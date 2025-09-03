// lib/mongodb.js - SIMPLIFIED VERSION
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// --- Global cache for mongoose connection ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// --- Main connectDB function using Mongoose ---
async function connectDB() {
  if (cached.conn) {
    console.log("♻️ Using existing MongoDB (Mongoose) connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔄 Establishing new MongoDB (Mongoose) connection...");

    // ✅ SIMPLIFIED: Remove all SSL/TLS options and let MongoDB handle it
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Let MongoDB handle SSL automatically
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(
          "✅ MongoDB (Mongoose) Connected Successfully"
        );
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        console.error("💡 Error details:", error);
        
        cached.promise = null;
        throw new Error(`Database connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }

  return cached.conn;
}

// --- Mongoose connection event listeners ---
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected from DB");
});

// ✅ Export
export default connectDB;
export { connectDB };