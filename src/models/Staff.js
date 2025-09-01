import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phone: { 
      type: String, 
      required: true,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,}$/, "Please enter a valid phone number"]
    },
    address: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 255
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["Admin", "Enrollment Officer", "Support Officer"],
      required: true,
      // Removed unique: true - multiple staff can have the same role type
      // Only one role per staff member, but multiple staff can share the same role
    },
    isBlocked: { 
      type: Boolean, 
      default: false 
    },
    lastLogin: {
      type: Date,
      default: null
    },
    profileImage: {
      type: String,
      default: null
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password; // Remove password when converting to JSON
        return ret;
      }
    }
  }
);

// Index for better query performance
StaffSchema.index({ email: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ isBlocked: 1 });
StaffSchema.index({ createdAt: -1 });

// Virtual for formatted created date
StaffSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Method to check if staff is active
StaffSchema.methods.isActive = function() {
  return !this.isBlocked;
};

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);