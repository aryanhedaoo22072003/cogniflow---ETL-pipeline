import { Schema, models, model } from "mongoose";

const ConnectionSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    type: { type: String, required: true }, // postgres | mysql | googlesheet | restapi | salesforce
    config: { type: Schema.Types.Mixed, default: {} },
    lastStatus: { type: String, enum: ["untested", "ok", "error"], default: "untested" },
    lastError: { type: String, default: "" },
    lastTestedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.Connection || model("Connection", ConnectionSchema);