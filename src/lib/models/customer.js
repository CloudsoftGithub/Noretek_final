import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Customer'
  },
  certifiName: {
    type: String,
    required: true
  },
  certifiNo: {
    type: String,
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  propertyUnit: {
    type: String,
    required: true
  },
  meterId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);