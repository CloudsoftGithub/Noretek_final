import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true, // quick lookup
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    customer_email: {
      type: String,
      required: true,
      index: true,
      match: /.+\@.+\..+/, // basic email validation
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "EUR"], // add more if needed
    },
    channel: {
      type: String,
      default: "paystack",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paid_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // auto-manage dates
  }
);

// Keep updated_at fresh on manual save
PaymentSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Reuse model if already compiled (important in Next.js hot reload)
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
