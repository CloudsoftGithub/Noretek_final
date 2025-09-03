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
    serverSelectionTimeoutMS: 10000, // Increased timeout
    socketTimeoutMS: 45000,
    ssl: true, // This is fine for native MongoDB client
    tlsAllowInvalidCertificates: false,
    retryWrites: true,
    w: 'majority'
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

    // ✅ FIXED: Use string values instead of booleans for Mongoose
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Use string values for SSL/TLS configuration
      ssl: 'true', // Changed from true to 'true'
      tls: 'true', // Changed from true to 'true'
      tlsAllowInvalidCertificates: 'false', // Changed from false to 'false'
      retryWrites: 'true', // Changed from true to 'true'
      w: 'majority',
      // Use string values for newer MongoDB driver options
      useNewUrlParser: 'true', // Changed from true to 'true'
      useUnifiedTopology: 'true', // Changed from true to 'true'
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(
          "✅ MongoDB (Mongoose) Connected Successfully:",
          MONGODB_URI.replace(/:[^:]*@/, ":****@") // mask password
        );
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        
        // More detailed error logging
        if (error.name === 'MongoServerSelectionError') {
          console.error("💡 Tip: Check if your IP is whitelisted in MongoDB Atlas");
          console.error("💡 Tip: Check if your MongoDB URI is correct");
        } else if (error.message.includes('SSL')) {
          console.error("💡 SSL/TLS connection issue detected");
          console.error("💡 Tip: Try updating your MongoDB driver or checking TLS settings");
        }
        
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
  
  // Handle specific SSL/TLS errors
  if (err.message.includes('SSL') || err.message.includes('TLS')) {
    console.error("🔐 SSL/TLS Error detected");
    console.error("💡 Try using string values ('true'/'false') instead of booleans");
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected from DB");
});

// Handle connection errors that occur after initial connection
mongoose.connection.on('close', () => {
  console.log('🔌 MongoDB connection closed');
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

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error);
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(1);
});

// ✅ Export both
export default connectDB;     // for Mongoose models
export { connectDB };         // named export (optional)

// Helper function to check connection status
export function getConnectionStatus() {
  return {
    readyState: mongoose.connection.readyState,
    state: mongoose.STATES[mongoose.connection.readyState],
    connected: mongoose.connection.readyState === 1
  };
}