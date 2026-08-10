import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Taskflow from "@/models/Taskflow";
import { requireOwnerId } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const taskflow = await Taskflow.findById(id).lean<any>();
    if (!taskflow || taskflow.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ taskflow });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Taskflow.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const nodes = body.nodes || [];
    const pipelineIds = nodes.filter((n: any) => n.type === "task" && n.config?.pipelineId).map((n: any) => n.config.pipelineId);
    const taskflow = await Taskflow.findByIdAndUpdate(
      id,
      { name: body.name, environment: body.environment, nodes, pipelineIds, stopOnFailure: body.stopOnFailure },
      { new: true }
    );
    return NextResponse.json({ taskflow });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Taskflow.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await Taskflow.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}