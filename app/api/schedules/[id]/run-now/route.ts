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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const schedule = await Schedule.findById(id);
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const result = await executeAndLogPipeline(schedule.pipelineId, "(scheduled — manual trigger)");
    schedule.lastRunAt = new Date();
    schedule.lastStatus = result.status;
    schedule.nextRunAt = computeNextRun(schedule);
    await schedule.save();

    return NextResponse.json({ schedule, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}