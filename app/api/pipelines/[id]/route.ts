import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import { requireOwnerId } from "@/lib/auth";
import PipelineVersion from "@/models/PipelineVersion";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const pipeline = await Pipeline.findById(id).lean<any>();
    if (!pipeline || pipeline.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ pipeline });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Pipeline.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const pipeline = await Pipeline.findByIdAndUpdate(
      id,
      { name: body.name, environment: body.environment, headers: body.headers, nodes: body.nodes, edges: body.edges || [] },
      { new: true }
    );
    const latestVer = await PipelineVersion.findOne({ pipelineId: id }).sort({ version: -1 }).lean<any>();
await PipelineVersion.create({
  pipelineId: id,
  ownerId,
  version: (latestVer?.version || 0) + 1,
  name: body.name,
  environment: body.environment,
  nodes: body.nodes,
  edges: body.edges || [],
  headers: body.headers || [],
  savedAt: new Date(),
});
    return NextResponse.json({ pipeline });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Pipeline.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await Pipeline.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}