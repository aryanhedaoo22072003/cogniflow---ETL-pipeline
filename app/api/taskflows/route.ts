import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Taskflow from "@/models/Taskflow";

const DEV_OWNER_ID = "anonymous";

export async function GET() {
  try {
    await connectDB();
    const taskflows = await Taskflow.find({ ownerId: DEV_OWNER_ID }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ taskflows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, taskflows: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const nodes = body.nodes || [];
    const pipelineIds = nodes.filter((n: any) => n.type === "task" && n.config?.pipelineId).map((n: any) => n.config.pipelineId);
    const taskflow = await Taskflow.create({
      name: body.name || "Untitled taskflow",
      ownerId: DEV_OWNER_ID,
      environment: body.environment || "DEV",
      nodes,
      pipelineIds,
      stopOnFailure: body.stopOnFailure ?? true,
    });
    return NextResponse.json({ taskflow }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}