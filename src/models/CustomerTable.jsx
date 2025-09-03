// models/CustomerTable.js
import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    certifiName: {
      type: String,
      required: true,
      trim: true,
    },
    certifiNo: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },
    propertyName: {
      type: String,
      required: true,
    },
    propertyUnit: {
      type: String,
      required: true,
    },
    // Additional fields for authentication and security
    isActive: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "locked", "suspended"],
      default: "active",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This will automatically manage createdAt and updatedAt
  }
);

// Index for better query performance
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ role: 1 });
CustomerSchema.index({ accountStatus: 1 });

// Method to check if account is locked
CustomerSchema.virtual('isLocked').get(function() {
  return this.accountStatus === 'locked' && 
         this.lockUntil && 
         this.lockUntil > Date.now();
});

// Prevent model overwrite in Next.js hot reload
const CustomerTable = mongoose.models.CustomerTable || mongoose.model("CustomerTable", CustomerSchema);

export default CustomerTable;