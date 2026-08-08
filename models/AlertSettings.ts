import { Schema, models, model } from "mongoose";

const AlertSettingsSchema = new Schema(
  {
    ownerId: { type: String, required: true, unique: true, index: true },
    slackWebhookUrl: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    lastTestAt: { type: Date },
    lastTestOk: { type: Boolean },
  },
  { timestamps: true }
);

export default models.AlertSettings || model("AlertSettings", AlertSettingsSchema);