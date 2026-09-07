import mongoose from "mongoose";

// Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX (70/71/72/75/76/77/78)
export const sriLankaMobile = /^(?:\+94|0)7(?:0|1|2|5|6|7|8)\d{7}$/;

const userSchema = new mongoose.Schema(
  {
    clerkId:             { type: String, required: true, unique: true, index: true },
    email:               { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:                { type: String, default: "", trim: true },
    mobile:              { type: String, match: sriLankaMobile, sparse: true },
    dob:                 { type: Date },
    gender:              { type: String, enum: ["Male", "Female"] },
    barRegNo:            { type: String, unique: true, sparse: true, trim: true },
    onboardingCompleted: { type: Boolean, default: false },
    isActive:            { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

