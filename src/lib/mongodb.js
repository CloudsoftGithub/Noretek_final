// lib/mongodb.js
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

// --- Global cache for native MongoDB client ---
let clientPromise;

// --- Function to get the native MongoDB client (for raw queries) ---
export function getClientPromise() {
  if (clientPromise) {
    return clientPromise;
  }

  const { MongoClient } = require("mongodb");

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  };

  if (process.env.NODE_ENV === "development") {
    // Reuse global connection in dev (hot reload friendly)
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // Always create a new client in production
    const client = new MongoClient(MONGODB_URI, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

// --- Main connectDB function using Mongoose ---
async function connectDB() {
  if (cached.conn) {
    console.log("♻️ Using existing MongoDB (Mongoose) connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔄 Establishing new MongoDB (Mongoose) connection...");

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(
        "✅ MongoDB (Mongoose) Connected Successfully:",
        MONGODB_URI.replace(/:[^:]*@/, ":****@") // mask password
      );
      return mongoose;
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

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

// ✅ Export both
export default connectDB;     // for Mongoose models
export { connectDB };         // named export (optional)
