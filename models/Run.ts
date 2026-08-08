import { Schema, models, model } from "mongoose";

const StepLogSchema = new Schema(
  {
    nodeId: String,
    label: String,
    ok: Boolean,
    message: String,
    rowsIn: Number,
    rowsOut: Number,
  },
  { _id: false }
);

const RunSchema = new Schema(
  {
    pipelineId: { type: String, required: true, index: true },
    pipelineName: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    environment: { type: String, default: "DEV" },
    status: { type: String, enum: ["success", "failed"], required: true },
    rowsIn: Number,
    rowsOut: Number,
    durationMs: Number,
    steps: { type: [StepLogSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Run || model("Run", RunSchema);
