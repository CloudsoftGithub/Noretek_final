// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/noretek_energy_db";
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!uri) {
  throw new Error("❌ Please add your MONGODB_URI to .env.local");
}

// In development, use global to preserve the value across hot reloads
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    console.log("🔄 Creating new MongoDB connection for development...");
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((connectedClient) => {
        console.log("✅ MongoDB Connected Successfully");
        return connectedClient;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Failed:", error.message);
        global._mongoClientPromise = null;
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client instance
  console.log("🔄 Creating new MongoDB connection for production...");
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log("✅ MongoDB Connected Successfully");
      return connectedClient;
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Failed:", error.message);
      throw error;
    });
}

// Helper function to get database instance
export async function getDatabase(dbName = "noretek_energy_db") {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("❌ Failed to get database:", error.message);
    throw error;
  }
}

// Helper function to check connection status
export async function checkConnection() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    return { connected: true, message: "✅ MongoDB connection is healthy" };
  } catch (error) {
    return { connected: false, message: `❌ MongoDB connection error: ${error.message}` };
  }
}

// Close connection gracefully
export async function closeConnection() {
  try {
    if (client) {
      await client.close();
      console.log("✅ MongoDB connection closed gracefully");
    }
    if (global._mongoClientPromise) {
      global._mongoClientPromise = null;
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error.message);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

export default clientPromise;