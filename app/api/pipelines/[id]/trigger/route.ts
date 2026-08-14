import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ApiKey, { hashApiKey } from "@/models/ApiKey";
import Pipeline from "@/models/Pipeline";
import { executeAndLogPipeline } from "@/lib/executePipeline";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization") || "";
    const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!rawKey) {
      return NextResponse.json({ error: "Missing Authorization header. Use: Bearer cgf_your_key" }, { status: 401 });
    }

    const keyHash = hashApiKey(rawKey);
    const apiKey = await ApiKey.findOne({ keyHash, enabled: true });
    if (!apiKey) {
      return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
    }

    const pipeline = await Pipeline.findById(id).lean<any>();
    if (!pipeline || pipeline.ownerId !== apiKey.ownerId) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    ApiKey.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() }).catch(() => {});

    const result = await executeAndLogPipeline(id, apiKey.ownerId, "(API trigger)");

    return NextResponse.json({
      status: result.status,
      pipelineName: result.pipelineName,
      rowsOut: result.rows.length,
      durationMs: result.durationMs,
      steps: result.steps.map((s) => ({ label: s.label, ok: s.ok, message: s.message, rowsOut: s.rowsOut })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}