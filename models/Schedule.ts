import { Schema, models, model } from "mongoose";

const ScheduleSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    pipelineId: { type: String, required: true },
    pipelineName: { type: String, required: true },
    scheduleType: { type: String, enum: ["interval", "daily"], default: "interval" },
    intervalMinutes: { type: Number }, // used when scheduleType === "interval"
    timeOfDay: { type: String }, // "HH:mm", used when scheduleType === "daily"
    timezone: { type: String, default: "UTC" }, // IANA zone, used when scheduleType === "daily"
    enabled: { type: Boolean, default: true },
    nextRunAt: { type: Date, required: true },
    lastRunAt: { type: Date },
    lastStatus: { type: String, enum: ["success", "failed", "never"], default: "never" },
  },
  { timestamps: true }
);

export default models.Schedule || model("Schedule", ScheduleSchema);