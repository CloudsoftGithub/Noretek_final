import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  meter_number: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  units: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  used_at: {
    type: Date,
    default: null
  },
   meterId: {
    type: String,
    required: true,
    index: true
  },
   createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['generated', 'used', 'expired'],
    default: 'generated'
  }
}, {
  timestamps: true
});

// Create indexes
TokenSchema.index({ reference: 1 });
TokenSchema.index({ token: 1 });
TokenSchema.index({ user_id: 1 });
TokenSchema.index({ meter_number: 1 });
TokenSchema.index({ expires_at: 1 });
TokenSchema.index({ status: 1 });

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);