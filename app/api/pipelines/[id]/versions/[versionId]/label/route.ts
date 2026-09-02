import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import PipelineVersion from "@/models/PipelineVersion";

// PATCH /api/pipelines/[id]/versions/[versionId]/label
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { versionId } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();
  const { label } = await req.json();
  const v = await PipelineVersion.findOneAndUpdate(
    { _id: versionId, ownerId },
    { label },
    { new: true }
  );
  if (!v) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}