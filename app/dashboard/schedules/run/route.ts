import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { executeAndLogPipeline } from "@/lib/executePipeline";
import { sendMail, buildTaskflowEmail } from "@/lib/mailer";
import AlertSettings from "@/models/AlertSettings";
import Taskflow from "@/models/Taskflow";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const now = new Date();
  const results: any[] = [];
  const schedules = await Schedule.find({ enabled: true }).lean<any[]>();

  for (const schedule of schedules) {
    try {
      const lastRun = schedule.lastRunAt ? new Date(schedule.lastRunAt) : null;
      if (!isDue(schedule, lastRun, now)) continue;

      if (schedule.taskflowId) {
        const taskflow = await Taskflow.findById(schedule.taskflowId).lean<any>();
        if (!taskflow) continue;

        const pipelineResults: any[] = [];
        const tfStart = Date.now();
        let taskflowStatus: "success" | "failed" = "success";

        for (const step of taskflow.steps || []) {
          try {
            const res = await executeAndLogPipeline(
              step.pipelineId, schedule.ownerId,
              `[Taskflow: ${taskflow.name}]`, false
            );
            pipelineResults.push({
              pipelineName: res.pipelineName,
              status: res.status,
              rowsOut: res.rows?.length || 0,
              durationMs: res.durationMs,
            });
            if (res.status === "failed") taskflowStatus = "failed";
          } catch (err: any) {
            pipelineResults.push({ pipelineName: step.pipelineId, status: "failed", rowsOut: 0, durationMs: 0 });
            taskflowStatus = "failed";
          }
        }

        const alertSettings = await AlertSettings.findOne({ ownerId: schedule.ownerId }).lean<any>();
        const emailTo = alertSettings?.alertEmail || process.env.ALERT_EMAIL_TO;

        if (emailTo && alertSettings?.emailEnabled) {
          const shouldSend = taskflowStatus === "failed"
            ? alertSettings.emailOnFailure !== false
            : alertSettings.emailOnSuccess !== false;
          if (shouldSend) {
            const html = buildTaskflowEmail({
              taskflowName: taskflow.name,
              status: taskflowStatus,
              pipelineResults,
              durationMs: Date.now() - tfStart,
              triggeredAt: now,
            });
            await sendMail({
              to: emailTo,
              subject: `CogniFlow · ${taskflowStatus === "success" ? "✓" : "✗"} Taskflow: ${taskflow.name}`,
              html,
            });
          }
        }

        results.push({ scheduleId: schedule._id, type: "taskflow", name: taskflow.name, status: taskflowStatus });

      } else if (schedule.pipelineId) {
        const alertSettings = await AlertSettings.findOne({ ownerId: schedule.ownerId }).lean<any>();
        const shouldEmail = !!(alertSettings?.emailEnabled &&
          (alertSettings?.alertEmail || process.env.ALERT_EMAIL_TO));

        const res = await executeAndLogPipeline(
          schedule.pipelineId, schedule.ownerId,
          `[Scheduled]`, shouldEmail
        );
        results.push({ scheduleId: schedule._id, type: "pipeline", name: res.pipelineName, status: res.status });
      }

      await Schedule.findByIdAndUpdate(schedule._id, { lastRunAt: now });

    } catch (err: any) {
      results.push({ scheduleId: schedule._id, error: err.message });
    }
  }

  return NextResponse.json({ ran: results.length, results });
}

/**
 * Check if a schedule is due based on its scheduleType/timeOfDay/timezone fields
 * (your Schedule model uses these instead of a cron string).
 */
function isDue(schedule: any, lastRun: Date | null, now: Date): boolean {
  // Never run before — run now
  if (!lastRun) return true;

  const scheduleType = schedule.scheduleType || "daily";

  if (scheduleType === "interval") {
    const intervalMs = (schedule.intervalMinutes || 60) * 60 * 1000;
    return now.getTime() - lastRun.getTime() >= intervalMs;
  }

  if (scheduleType === "daily") {
    // Check if last run was more than 23 hours ago (prevents double-firing)
    const moreThan23hAgo = now.getTime() - lastRun.getTime() > 23 * 60 * 60 * 1000;
    if (!moreThan23hAgo) return false;

    // Check if current time matches the scheduled time in the target timezone
    if (schedule.timeOfDay) {
      const [targetHour, targetMinute] = schedule.timeOfDay.split(":").map(Number);
      const tz = schedule.timezone || "UTC";

      try {
        // Get current time in the schedule's timezone
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const parts = formatter.formatToParts(now);
        const currentHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
        const currentMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

        // Match within a 5-minute window
        const scheduledMinutes = targetHour * 60 + targetMinute;
        const currentMinutes = currentHour * 60 + currentMinute;
        return Math.abs(currentMinutes - scheduledMinutes) <= 5;
      } catch {
        // Timezone parse error — fall back to just checking 23h gap
        return moreThan23hAgo;
      }
    }

    return moreThan23hAgo;
  }

  if (scheduleType === "weekly") {
    return now.getTime() - lastRun.getTime() >= 7 * 24 * 60 * 60 * 1000;
  }

  // Fallback — if cron string exists use it
  if (schedule.cron) {
    if (schedule.cron === "@daily") return now.getTime() - lastRun.getTime() >= 24 * 60 * 60 * 1000;
    if (schedule.cron === "@hourly") return now.getTime() - lastRun.getTime() >= 60 * 60 * 1000;
  }

  return false;
}