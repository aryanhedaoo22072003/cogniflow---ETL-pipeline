import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import { requireOwnerId } from "@/lib/auth";

const NEXT_ENV: Record<string, string> = { DEV: "SIT", SIT: "PROD" };

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const source = await Pipeline.findById(id).lean<any>();
    if (!source || source.ownerId !== ownerId) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    const targetEnv = NEXT_ENV[source.environment];
    if (!targetEnv) {
      return NextResponse.json({ error: `${source.environment} has no next environment to promote to` }, { status: 400 });
    }

    const existing = await Pipeline.findOne({ ownerId, promotedFrom: id, environment: targetEnv });

    const clonedNodes = source.nodes.map((n: any) => {
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
        ownerId,
        environment: targetEnv,
        headers: source.headers,
        nodes: clonedNodes,
        promotedFrom: id,
      });
    }

    return NextResponse.json({ pipeline, promotedTo: targetEnv, wasUpdate: !!existing });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}