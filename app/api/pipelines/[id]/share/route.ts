import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import crypto from "crypto";

// POST /api/pipelines/[id]/share — generate a share token
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();

  const pipeline = await Pipeline.findById(id).lean<any>();
  if (!pipeline || pipeline.ownerId !== ownerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Generate or reuse share token
  const shareToken = pipeline.shareToken || crypto.randomBytes(16).toString("hex");
  await Pipeline.findByIdAndUpdate(id, { shareToken, shareEnabled: true });

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${shareToken}`;
  return NextResponse.json({ shareToken, shareUrl });
}

// DELETE /api/pipelines/[id]/share — revoke share
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();

  await Pipeline.findOneAndUpdate(
    { _id: id, ownerId },
    { shareToken: null, shareEnabled: false }
  );
  return NextResponse.json({ ok: true });
}