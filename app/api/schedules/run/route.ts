import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { executeAndLogPipeline } from "@/lib/executePipeline";
import { sendMail, buildTaskflowEmail } from "@/lib/mailer";
import AlertSettings from "@/models/AlertSettings";
import Taskflow from "@/models/Taskflow";

/**
 * POST /api/schedules/run
 * Called by a cron job (e.g. Vercel cron, GitHub Actions, or an external scheduler).
 * Finds all schedules due to run, executes them, and sends email notifications.
 */
export async function POST(req: Request) {
  // Simple secret check so this endpoint can't be called publicly
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const now = new Date();
  const results: any[] = [];

  // Find all enabled schedules
  const schedules = await Schedule.find({ enabled: true }).lean<any[]>();

  for (const schedule of schedules) {
    try {
      const lastRun = schedule.lastRunAt ? new Date(schedule.lastRunAt) : null;
      if (!isDue(schedule.cron, lastRun, now)) continue;

      // It's a taskflow schedule
      if (schedule.taskflowId) {
        const taskflow = await Taskflow.findById(schedule.taskflowId).lean<any>();
        if (!taskflow) continue;

        const pipelineResults: any[] = [];
        const tfStart = Date.now();
        let taskflowStatus: "success" | "failed" = "success";

        for (const step of taskflow.steps || []) {
          try {
            const res = await executeAndLogPipeline(
              step.pipelineId,
              schedule.ownerId,
              `[Taskflow: ${taskflow.name}]`,
              false // don't send individual emails — taskflow sends one summary
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

        const tfDuration = Date.now() - tfStart;

        // Send taskflow summary email
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
              durationMs: tfDuration,
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
        // Single pipeline schedule
        const alertSettings = await AlertSettings.findOne({ ownerId: schedule.ownerId }).lean<any>();
        const shouldEmail = alertSettings?.emailEnabled &&
          (alertSettings?.emailOnSuccess !== false || alertSettings?.emailOnFailure !== false);

        const res = await executeAndLogPipeline(
          schedule.pipelineId,
          schedule.ownerId,
          `[Scheduled]`,
          shouldEmail // send email for scheduled runs
        );
        results.push({ scheduleId: schedule._id, type: "pipeline", name: res.pipelineName, status: res.status });
      }

      // Update lastRunAt
      await Schedule.findByIdAndUpdate(schedule._id, { lastRunAt: now });

    } catch (err: any) {
      results.push({ scheduleId: schedule._id, error: err.message });
    }
  }

  return NextResponse.json({ ran: results.length, results });
}

/**
 * Minimal cron checker — checks if schedule is due based on cron expression.
 * Supports: @daily, @hourly, or basic "minute hour * * *" patterns.
 */
function isDue(cron: string, lastRun: Date | null, now: Date): boolean {
  if (!lastRun) return true; // never run — run now

  if (cron === "@daily") {
    return now.getTime() - lastRun.getTime() >= 24 * 60 * 60 * 1000;
  }
  if (cron === "@hourly") {
    return now.getTime() - lastRun.getTime() >= 60 * 60 * 1000;
  }
  if (cron === "@weekly") {
    return now.getTime() - lastRun.getTime() >= 7 * 24 * 60 * 60 * 1000;
  }

  // Basic "MM HH * * *" — check if hour+minute matches and last run was > 23h ago
  const parts = cron.split(" ");
  if (parts.length >= 2) {
    const [minute, hour] = parts;
    const nowH = now.getUTCHours(), nowM = now.getUTCMinutes();
    const matchesTime =
      (hour === "*" || parseInt(hour) === nowH) &&
      (minute === "*" || parseInt(minute) === nowM);
    const notRunRecently = now.getTime() - lastRun.getTime() > 55 * 60 * 1000; // 55 min buffer
    return matchesTime && notRunRecently;
  }

  return false;
}