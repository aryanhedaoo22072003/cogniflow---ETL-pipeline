import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import { requireOwnerId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const env = req.nextUrl.searchParams.get("environment") || undefined;
    const query: Record<string, any> = { ownerId };
    if (env) query.environment = env;
    // const pipelines = await Pipeline.find(query).sort({ updatedAt: -1 }).lean();
    const pipelines = await Pipeline.find(query)
  .select("-nodes.config.rows -nodes.config.sampleRows -nodes.config.referenceRows")
  .sort({ updatedAt: -1 })
  .lean();
    return NextResponse.json({ pipelines });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, pipelines: [] }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const pipeline = await Pipeline.create({
      name: body.name || "Untitled pipeline",
      ownerId,
      environment: body.environment || "DEV",
      headers: body.headers || [],
      nodes: body.nodes || [],
    });
    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}// Force dynamic so Next.js doesn't cache stale auth state
export const dynamic = "force-dynamic";
