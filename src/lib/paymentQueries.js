// Import required modules at the top
import connectDB from "./mongodb"; // adjust path if different
import Token from "./models/Token"; // adjust path if different
import mongoose from "mongoose";
import db from "./db";

const paymentQueries = {
  // Create token record
  createToken: async (tokenData) => {
    try {
      await connectDB();

      // Calculate expiration date (72 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 72);

      const token = new Token({
        reference: tokenData.reference,
        meter_number: tokenData.meterId,
        amount: tokenData.amount,
        units: tokenData.units,
        token: tokenData.token,
        user_id: tokenData.userId,
        expires_at: expiresAt,
        status: "generated",
      });

      await token.save();
      return token._id;
    } catch (error) {
      console.error("Error creating token record:", error);
      throw error;
    }
  },

  // Get token history for a meter
  getTokenHistory: async (meterNumber) => {
    try {
      await connectDB();

      const tokens = await Token.find({ meter_number: meterNumber })
        .sort({ createdAt: -1 })
        .limit(20);

      return tokens.map((token) => ({
        date: token.createdAt,
        token: token.token,
        amount: token.amount,
        units: token.units,
        status: token.used ? "used" : token.status,
        reference: token.reference,
      }));
    } catch (error) {
      console.error("Error fetching token history:", error);
      throw error;
    }
  },

  // Get meter information
  getMeterInfo: async (meterNumber) => {
    try {
      await connectDB();

      const propertyUnit = await mongoose.models.PropertyUnit.findOne({
        meter_id: meterNumber,
      }).populate("property_id");

      if (!propertyUnit) {
        return null;
      }

      const customer = await mongoose.models.Customer.findOne({
        meterId: meterNumber,
      });

      const tokens = await Token.find({
        meter_number: meterNumber,
        status: "generated",
        used: false,
      });

      const balance = tokens.reduce((total, token) => total + token.amount, 0);

      return {
        meterId: meterNumber,
        customerName: customer?.name || "Not assigned",
        propertyName: propertyUnit.property_id?.property_name || "Unknown",
        unitDescription: propertyUnit.unit_description || "Unknown",
        blockNo: propertyUnit.blockno || "N/A",
        balance,
        status: customer ? "active" : "inactive",
        lastTokenDate: tokens.length > 0 ? tokens[0].createdAt : null,
      };
    } catch (error) {
      console.error("Error fetching meter info:", error);
      throw error;
    }
  },

  // Mark token as used
  markTokenAsUsed: async (tokenString, meterNumber) => {
    try {
      await connectDB();

      const token = await Token.findOneAndUpdate(
        { token: tokenString, meter_number: meterNumber },
        { used: true, used_at: new Date(), status: "used" },
        { new: true }
      );

      return token;
    } catch (error) {
      console.error("Error marking token as used:", error);
      throw error;
    }
  },

  // Get token by reference
  getTokenByReference: async (reference) => {
    try {
      await connectDB();
      return await Token.findOne({ reference });
    } catch (error) {
      console.error("Error fetching token by reference:", error);
      throw error;
    }
  },

  // Check if token exists and is valid
  validateToken: async (tokenString, meterNumber) => {
    try {
      await connectDB();

      const token = await Token.findOne({
        token: tokenString,
        meter_number: meterNumber,
        used: false,
        expires_at: { $gt: new Date() },
      });

      return {
        isValid: !!token,
        token,
        message: token ? "Token is valid" : "Token not found or already used",
      };
    } catch (error) {
      console.error("Error validating token:", error);
      throw error;
    }
  },
};

// ✅ Use ESM export (Next.js friendly)
export default paymentQueries;
