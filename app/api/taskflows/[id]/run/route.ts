import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Taskflow from "@/models/Taskflow";
import { executeAndLogPipeline } from "@/lib/executePipeline";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const taskflow = await Taskflow.findById(id).lean<any>();
    if (!taskflow) return NextResponse.json({ error: "Taskflow not found" }, { status: 404 });

    const taskNodes = (taskflow.nodes || []).filter((n: any) => n.type === "task");
    const results: any[] = [];
    let overallStatus: "success" | "failed" = "success";

    for (const node of taskNodes) {
      const pipelineId = node.config?.pipelineId;
      const continueOnFailure = !!node.config?.continueOnFailure;
      if (!pipelineId) continue;
      try {
        const result = await executeAndLogPipeline(pipelineId, `(via Taskflow: ${taskflow.name})`);
        results.push({ ...result, nodeId: node.id });
        if (result.status === "failed") {
          overallStatus = "failed";
          if (!continueOnFailure && taskflow.stopOnFailure) break;
        }
      } catch (e: any) {
        results.push({ pipelineId, status: "failed", error: e.message, steps: [], nodeId: node.id });
        overallStatus = "failed";
        if (!continueOnFailure && taskflow.stopOnFailure) break;
      }
    }

    return NextResponse.json({ taskflowName: taskflow.name, status: overallStatus, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}