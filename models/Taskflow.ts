import { Schema, models, model } from "mongoose";

const TaskflowNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true }, // start | task | end
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed, default: {} }, // task: { pipelineId, pipelineName, continueOnFailure }
  },
  { _id: false }
);

const TaskflowSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    environment: { type: String, default: "DEV" },
    nodes: { type: [TaskflowNodeSchema], default: [] },
    pipelineIds: { type: [String], default: [] }, // derived from task nodes, kept for quick display
    stopOnFailure: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Taskflow || model("Taskflow", TaskflowSchema);