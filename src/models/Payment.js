// src/models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
      default: null,
    },
    customer_email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    
    // Meter information (required for token purchases)
    meter_id: {
      type: String,
      required: function() {
        // Required only for electricity token purchases
        return this.metadata?.purchase_type === 'electricity_token';
      },
      index: true,
      trim: true,
      default: null,
    },
    meter_number: {
      type: String,
      trim: true,
      default: null,
    },
    
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be >= 0"],
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "EUR"],
    },
    channel: {
      type: String,
      default: "paystack",
      enum: ["paystack", "flutterwave", "stripe", "bank_transfer", "cash"],
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    
    // Token information (for electricity token purchases)
    token_amount: {
      type: Number,
      min: [0, "Token amount must be >= 0"],
      default: null,
    },
    token_code: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    token_expiry: {
      type: Date,
      default: null,
    },
    
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Example structure:
      // {
      //   purchase_type: "electricity_token" | "bill_payment" | "wallet_topup",
      //   disco: "ikeja_electric" | "eko_electric" | etc.,
      //   tariff: "residential" | "commercial",
      //   phone_number: "+234...",
      //   address: "Customer address",
      //   units: 50.5 // kWh units purchased
      // }
    },
    paid_at: {
      type: Date,
      default: null,
    },
    
    // Additional fields for better tracking
    transaction_id: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    payment_method: {
      type: String,
      enum: ["card", "bank_transfer", "ussd", "mobile_money", "cash"],
      default: "card",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Virtual for purchase date (alias for created_at)
PaymentSchema.virtual('purchase_date').get(function() {
  return this.created_at;
});

// Indexes for better query performance
PaymentSchema.index({ customer_email: 1, created_at: -1 });
PaymentSchema.index({ meter_id: 1, status: 1 });
PaymentSchema.index({ status: 1, created_at: -1 });
PaymentSchema.index({ token_code: 1 }, { sparse: true });

PaymentSchema.pre("save", function (next) {
  this.updated_at = new Date();
  
  // Auto-set token_amount if not provided for electricity token purchases
  if (this.metadata?.purchase_type === 'electricity_token' && 
      !this.token_amount && 
      this.amount) {
    this.token_amount = this.amount; // Or apply conversion logic if needed
  }
  
  next();
});

// Method to check if payment is for electricity token
PaymentSchema.methods.isTokenPurchase = function() {
  return this.metadata?.purchase_type === 'electricity_token';
};

// Static method to find payments by email
PaymentSchema.statics.findByEmail = function(email, limit = 50) {
  return this.find({ customer_email: email })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();
};

// Static method to find token history by meter ID
PaymentSchema.statics.findTokenHistoryByMeterId = function(meterId, limit = 50) {
  return this.find({ 
    meter_id: meterId,
    status: 'success',
    'metadata.purchase_type': 'electricity_token'
  })
  .select('token_amount token_code created_at meter_id customer_email amount status')
  .sort({ created_at: -1 })
  .limit(limit)
  .lean();
};

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;