import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { executeAndLogPipeline } from "@/lib/executePipeline";
import { nextDailyRunUTC } from "@/lib/scheduling";

function computeNextRun(schedule: any): Date {
  if (schedule.scheduleType === "daily") {
    return nextDailyRunUTC(schedule.timezone || "UTC", schedule.timeOfDay || "09:00");
  }
  return new Date(Date.now() + (schedule.intervalMinutes || 60) * 60 * 1000);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const provided = req.nextUrl.searchParams.get("secret");
      if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const due = await Schedule.find({ enabled: true, nextRunAt: { $lte: new Date() } });
    const results = [];

    for (const schedule of due) {
      try {
        const result = await executeAndLogPipeline(schedule.pipelineId, "(scheduled)");
        schedule.lastRunAt = new Date();
        schedule.lastStatus = result.status;
        schedule.nextRunAt = computeNextRun(schedule);
        await schedule.save();
        results.push({ scheduleId: schedule._id, pipelineName: schedule.pipelineName, status: result.status });
      } catch (e: any) {
        schedule.lastRunAt = new Date();
        schedule.lastStatus = "failed";
        schedule.nextRunAt = computeNextRun(schedule);
        await schedule.save();
        results.push({ scheduleId: schedule._id, pipelineName: schedule.pipelineName, status: "failed", error: e.message });
      }
    }

    return NextResponse.json({ checked: due.length, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}