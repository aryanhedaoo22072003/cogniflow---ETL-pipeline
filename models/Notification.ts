import mongoose, { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["run_success", "run_failed", "schedule_triggered", "version_restored", "pipeline_shared", "info"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    pipelineId: { type: String, default: null },
    pipelineName: { type: String, default: null },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Keep max 100 notifications per user
NotificationSchema.index({ ownerId: 1, createdAt: -1 });

export default models.Notification || model("Notification", NotificationSchema);