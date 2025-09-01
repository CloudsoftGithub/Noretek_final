import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // 🚀 ensures password is not returned by default in queries
    },
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profile: {
      fullName: { type: String, trim: true },
      avatar: { type: String, default: "" }, // URL to profile picture
    },
  },
  { timestamps: true }
);

// ✅ Indexes for optimized search & login lookups
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

// ✅ Pre-save middleware to update lastLogin automatically if needed
UserSchema.pre("save", function (next) {
  if (this.isModified("lastLogin")) {
    this.lastLogin = new Date();
  }
  next();
});

// ✅ Transform response to hide sensitive data when converting to JSON
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password; // remove password field
    delete ret.__v; // remove mongoose version field
    return ret;
  },
});

// 🚀 Prevent model overwrite in hot reload / dev mode
export default mongoose.models.User || mongoose.model("User", UserSchema);
