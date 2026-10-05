import mongoose, { Schema } from "mongoose";

const UserPlanSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    planId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.UserPlan || mongoose.model("UserPlan", UserPlanSchema);