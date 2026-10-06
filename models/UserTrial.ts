import mongoose, { Schema } from "mongoose";

const UserTrialSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    startedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.UserTrial || mongoose.model("UserTrial", UserTrialSchema);