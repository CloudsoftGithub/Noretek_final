import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  customer_email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  channel: {
    type: String,
    default: 'paystack'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: Object,
    default: {}
  },
  paid_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create index for better query performance
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ customer_email: 1 });
PaymentSchema.index({ user_id: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);