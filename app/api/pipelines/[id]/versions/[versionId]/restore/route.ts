import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import PipelineVersion from "@/models/PipelineVersion";
import Pipeline from "@/models/Pipeline";

// POST /api/pipelines/[id]/versions/[versionId]/restore
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { id, versionId } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();

  const snap = await PipelineVersion.findById(versionId).lean<any>();
  if (!snap || snap.ownerId !== ownerId || snap.pipelineId !== id) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Snapshot current state before restoring
  const pipeline = await Pipeline.findById(id).lean<any>();
  if (pipeline) {
    const latest = await PipelineVersion.findOne({ pipelineId: id }).sort({ version: -1 }).lean<any>();
    await PipelineVersion.create({
      pipelineId: id,
      ownerId,
      version: (latest?.version || 0) + 1,
      name: pipeline.name,
      environment: pipeline.environment,
      nodes: pipeline.nodes,
      edges: pipeline.edges || [],
      headers: pipeline.headers || [],
      label: `Auto-snapshot before restore to v${snap.version}`,
      savedAt: new Date(),
    });
  }

  // Restore the selected version
  await Pipeline.findByIdAndUpdate(id, {
    nodes: snap.nodes,
    edges: snap.edges,
    headers: snap.headers,
    environment: snap.environment,
  });

  return NextResponse.json({ ok: true, restoredVersion: snap.version });
}