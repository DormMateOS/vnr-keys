import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["faculty", "security", "admin", "pending"],
      default: "pending", // Default for new users who need to complete registration
    },
    department: {
      type: String,
      enum: [
        "CSE",
        "EEE",
        "CSE-AIML",
        
        "IoT",
        "ECE",
        "MECH",
        "CIVIL",
        "IT"
      ],
      required: function() {
        // Department is required only for faculty
        return this.role === "faculty";
      },
    },
    facultyId: {
      type: String,
      required: function() {
        // Faculty ID is required only for faculty
        return this.role === "faculty";
      },
      unique: true,
      sparse: true, // Allows multiple null values for non-faculty users
    },
    // OAuth fields (required since we only use Google OAuth)
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["google"],
      default: "google",
      required: true,
    },
    avatar: {
      type: String, // URL to profile picture from Google
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: true, // All Google OAuth users are automatically verified
    },
    // Optional profile fields
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
    },
    website: {
      type: String,
      default: "",
      maxlength: 200,
    },
    keyUsage: {
      type: Map,
      of: Number, // keyId -> usage count
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
