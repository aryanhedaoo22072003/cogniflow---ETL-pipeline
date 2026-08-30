// import { Schema, models, model } from "mongoose";

// const AlertSettingsSchema = new Schema(
//   {
//     ownerId: { type: String, required: true, unique: true, index: true },
//     slackWebhookUrl: { type: String, default: "" },
//     enabled: { type: Boolean, default: false },
//     lastTestAt: { type: Date },
//     lastTestOk: { type: Boolean },
//   },
//   { timestamps: true }
// );

// export default models.AlertSettings || model("AlertSettings", AlertSettingsSchema);

import mongoose from "mongoose";

const AlertSettingsSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    slackWebhookUrl: { type: String, default: "" },
    // Email alert settings
    emailEnabled: { type: Boolean, default: false },
    alertEmail: { type: String, default: "" }, // where to send alerts
    emailOnSuccess: { type: Boolean, default: true },  // send on every scheduled run
    emailOnFailure: { type: Boolean, default: true },  // send on failure (always)
  },
  { timestamps: true }
);

export default mongoose.models.AlertSettings ||
  mongoose.model("AlertSettings", AlertSettingsSchema);