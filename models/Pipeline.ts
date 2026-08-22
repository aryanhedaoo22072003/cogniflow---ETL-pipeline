import mongoose, { Schema, models, model } from "mongoose";

const NodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const PipelineSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true, index: true }, // Clerk user id, or "anonymous" until auth is wired
    environment: { type: String, enum: ["DEV", "SIT", "PROD"], default: "DEV" },
    headers: { type: [String], default: [] },
    nodes: { type: [NodeSchema], default: [] },
    promotedFrom: { type: String, default: null }, // pipeline id this was promoted from, if any. 
    fromTemplate: { type: String, default: null },
  },
  { timestamps: true }
);

export default models.Pipeline || model("Pipeline", PipelineSchema);
