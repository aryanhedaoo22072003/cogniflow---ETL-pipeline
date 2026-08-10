import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import Pipeline from "@/models/Pipeline";
import { nextDailyRunUTC } from "@/lib/scheduling";
import { requireOwnerId } from "@/lib/auth";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const schedules = await Schedule.find({ ownerId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ schedules });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, schedules: [] }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const pipeline = await Pipeline.findById(body.pipelineId).lean<any>();
    if (!pipeline || pipeline.ownerId !== ownerId) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    const scheduleType = body.scheduleType === "daily" ? "daily" : "interval";
    let nextRunAt: Date;
    let intervalMinutes: number | undefined;
    let timeOfDay: string | undefined;
    let timezone: string | undefined;

    if (scheduleType === "daily") {
      const resolvedTimeOfDay = body.timeOfDay || "09:00";
      const resolvedTimezone = body.timezone || "UTC";
      timeOfDay = resolvedTimeOfDay;
      timezone = resolvedTimezone;
      nextRunAt = nextDailyRunUTC(resolvedTimezone, resolvedTimeOfDay);
    } else {
      intervalMinutes = Number(body.intervalMinutes) || 60;
      nextRunAt = new Date(Date.now() + intervalMinutes * 60 * 1000);
    }

    const schedule = await Schedule.create({
      ownerId,
      pipelineId: body.pipelineId,
      pipelineName: pipeline.name,
      scheduleType,
      intervalMinutes,
      timeOfDay,
      timezone,
      enabled: true,
      nextRunAt,
    });
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}