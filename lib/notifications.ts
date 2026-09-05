import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

interface CreateNotificationOptions {
  ownerId: string;
  type: "run_success" | "run_failed" | "schedule_triggered" | "version_restored" | "pipeline_shared" | "info";
  title: string;
  message: string;
  pipelineId?: string;
  pipelineName?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(opts: CreateNotificationOptions) {
  try {
    await connectDB();
    await Notification.create(opts);

    // Keep max 100 per user — delete oldest if over limit
    const count = await Notification.countDocuments({ ownerId: opts.ownerId });
    if (count > 100) {
      const oldest = await Notification.find({ ownerId: opts.ownerId })
        .sort({ createdAt: 1 })
        .limit(count - 100)
        .select("_id")
        .lean();
      await Notification.deleteMany({ _id: { $in: oldest.map((n: any) => n._id) } });
    }
  } catch (err) {
    console.error("[notifications] Failed to create:", err);
  }
}