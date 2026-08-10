import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Taskflow from "@/models/Taskflow";
import { requireOwnerId } from "@/lib/auth";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const taskflows = await Taskflow.find({ ownerId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ taskflows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, taskflows: [] }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const nodes = body.nodes || [];
    const pipelineIds = nodes.filter((n: any) => n.type === "task" && n.config?.pipelineId).map((n: any) => n.config.pipelineId);
    const taskflow = await Taskflow.create({
      name: body.name || "Untitled taskflow",
      ownerId,
      environment: body.environment || "DEV",
      nodes,
      pipelineIds,
      stopOnFailure: body.stopOnFailure ?? true,
    });
    return NextResponse.json({ taskflow }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}