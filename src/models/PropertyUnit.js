import mongoose from 'mongoose';

const PropertyUnitSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  unit_description: {
    type: String,
    required: true
  },
  blockno: {
    type: String,
    required: true
  },
  meter_id: {
    type: String,
    required: true,
    unique: true
  },
  captured_by: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.PropertyUnit || mongoose.model('PropertyUnit', PropertyUnitSchema);