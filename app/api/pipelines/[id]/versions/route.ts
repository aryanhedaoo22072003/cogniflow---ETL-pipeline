import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import PipelineVersion from "@/models/PipelineVersion";
import Pipeline from "@/models/Pipeline";

// GET /api/pipelines/[id]/versions — list all versions
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();

  const versions = await PipelineVersion.find({ pipelineId: id, ownerId })
    .select("-nodes.config.rows -nodes.config.sampleRows -nodes.config.referenceRows -edges")
    .sort({ version: -1 })
    .lean();

  return NextResponse.json({ versions });
}

// POST /api/pipelines/[id]/versions — create a manual snapshot with optional label
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();

  const pipeline = await Pipeline.findById(id).lean<any>();
  if (!pipeline || pipeline.ownerId !== ownerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const label = body.label || "";

  const latest = await PipelineVersion.findOne({ pipelineId: id }).sort({ version: -1 }).lean<any>();
  const version = (latest?.version || 0) + 1;

  const snap = await PipelineVersion.create({
    pipelineId: id,
    ownerId,
    version,
    name: pipeline.name,
    environment: pipeline.environment,
    nodes: pipeline.nodes,
    edges: pipeline.edges || [],
    headers: pipeline.headers || [],
    label,
    savedAt: new Date(),
  });

  // Keep max 50 versions — delete oldest if over limit
  const count = await PipelineVersion.countDocuments({ pipelineId: id });
  if (count > 50) {
    const oldest = await PipelineVersion.findOne({ pipelineId: id }).sort({ version: 1 }).lean<any>();
    if (oldest) await PipelineVersion.findByIdAndDelete(oldest._id);
  }

  return NextResponse.json({ version: snap });
}