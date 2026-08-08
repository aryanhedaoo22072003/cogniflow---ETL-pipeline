import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import { diffPipelineNodes } from "@/lib/diffPipeline";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const target = await Pipeline.findById(id).lean<any>();
    if (!target) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    if (!target.promotedFrom) {
      return NextResponse.json(
        { error: "This pipeline wasn't promoted from another environment, so there's nothing to diff it against." },
        { status: 400 }
      );
    }

    const source = await Pipeline.findById(target.promotedFrom).lean<any>();
    if (!source) {
      return NextResponse.json(
        { error: "The source pipeline this was promoted from no longer exists." },
        { status: 404 }
      );
    }

const diff = diffPipelineNodes(source.nodes, target.nodes);
    const summary = {
      added: diff.filter((d) => d.status === "added").length,
      removed: diff.filter((d) => d.status === "removed").length,
      modified: diff.filter((d) => d.status === "modified").length,
      unchanged: diff.filter((d) => d.status === "unchanged").length,
    };
    const statusById: Record<string, string> = {};
    diff.forEach((d) => (statusById[d.id] = d.status));
    const changedFieldsById: Record<string, any[]> = {};
    diff.forEach((d) => {
      if (d.changedFields) changedFieldsById[d.id] = d.changedFields;
    });

    const sortByX = (nodes: any[]) => [...nodes].sort((a, b) => a.x - b.x);
    const sourceNodes = sortByX(source.nodes).map((n: any) => ({ id: n.id, type: n.type, label: n.label }));
    const targetNodes = sortByX(target.nodes).map((n: any) => ({ id: n.id, type: n.type, label: n.label }));

    return NextResponse.json({
      source: { id: source._id, name: source.name, environment: source.environment },
      target: { id: target._id, name: target.name, environment: target.environment },
      sourceNodes,
      targetNodes,
      statusById,
      changedFieldsById,
      diff,
      summary,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}