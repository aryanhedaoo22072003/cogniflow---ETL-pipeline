import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";

const DEV_OWNER_ID = "anonymous";
const NEXT_ENV: Record<string, string> = { DEV: "SIT", SIT: "PROD" };

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const source = await Pipeline.findById(id).lean<any>();
    if (!source) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    const targetEnv = NEXT_ENV[source.environment];
    if (!targetEnv) {
      return NextResponse.json({ error: `${source.environment} has no next environment to promote to` }, { status: 400 });
    }

    // Check if a promoted copy already exists (same source pipeline, target env) — if so, overwrite it
    // instead of creating duplicates every time someone re-promotes.
    const existing = await Pipeline.findOne({
      ownerId: DEV_OWNER_ID,
      promotedFrom: id,
      environment: targetEnv,
    });

    const clonedNodes = source.nodes.map((n: any) => {
      // Strip inline uploaded CSV data from Source nodes on promotion — a DEV pipeline's
      // sample CSV shouldn't silently travel into SIT/PROD as "real" data. The pipeline
      // shape and all transform config comes across; the source just needs reattaching.
      if (n.type === "source" && n.config?.mode === "upload") {
        return { ...n, config: { ...n.config, rows: [], fileName: "", headers: source.headers } };
      }
      return n;
    });

    let pipeline;
    if (existing) {
      existing.nodes = clonedNodes;
      existing.headers = source.headers;
      existing.name = source.name;
      pipeline = await existing.save();
    } else {
      pipeline = await Pipeline.create({
        name: source.name,
        ownerId: DEV_OWNER_ID,
        environment: targetEnv,
        headers: source.headers,
        nodes: clonedNodes,
        promotedFrom: id,
      });
    }

    return NextResponse.json({ pipeline, promotedTo: targetEnv, wasUpdate: !!existing });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}