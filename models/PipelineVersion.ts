import mongoose, { model, models, Schema } from "mongoose";

const PipelineVersionSchema = new Schema(
  {
    pipelineId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true },
    version: { type: Number, required: true }, // 1, 2, 3...
    name: { type: String, required: true },
    environment: { type: String, default: "DEV" },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    headers: { type: Array, default: [] },
    savedAt: { type: Date, default: Date.now },
    label: { type: String, default: "" }, // optional user label e.g. "Before SCD refactor"
  },
  { timestamps: false }
);

// Keep max 50 versions per pipeline
PipelineVersionSchema.index({ pipelineId: 1, version: -1 });

export default models.PipelineVersion ||
  model("PipelineVersion", PipelineVersionSchema);