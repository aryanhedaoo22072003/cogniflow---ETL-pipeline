// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Pipeline from "@/models/Pipeline";
// import PipelineConnection from "@/models/Connection";
// import Run from "@/models/Run";
// import { runPipeline, PipelineNode } from "@/lib/transforms";
// import { fetchConnectionData } from "@/lib/connectors";

// const DEV_OWNER_ID = "anonymous";

// export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   try {
//     await connectDB();
//     const pipeline = await Pipeline.findById(id).lean<any>();
//     if (!pipeline) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

//     // Resolve any source node backed by a saved Connection into live rows
//     // before running the transform chain. Source nodes backed by an uploaded
//     // CSV already carry rows/headers in their config, so this is a no-op for them.
//     const nodes: PipelineNode[] = await Promise.all(
//       pipeline.nodes.map(async (n: any) => {
//         if (n.type === "source" && n.config?.connectionId && !n.config?.rows?.length) {
//           const conn = await PipelineConnection.findById(n.config.connectionId).lean<any>();
//           if (!conn) return n;
//           const result = await fetchConnectionData({ type: conn.type, ...conn.config });
//           return {
//             ...n,
//             config: {
//               ...n.config,
//               rows: result.rows,
//               headers: result.headers,
//               connectionName: conn.name,
//               fetchError: result.ok ? null : result.error,
//             },
//           };
//         }
//         return n;
//       })
//     );

//     const start = Date.now();
//     const result = runPipeline([], [], nodes);
//     const durationMs = Date.now() - start;

//     const run = await Run.create({
//       pipelineId: id,
//       pipelineName: pipeline.name,
//       ownerId: DEV_OWNER_ID,
//       environment: pipeline.environment,
//       status: result.status,
//       rowsIn: result.steps[0]?.rowsOut ?? 0,
//       rowsOut: result.finalRows.length,
//       durationMs,
//       steps: result.steps,
//     });

//     return NextResponse.json({
//       run,
//       rows: result.finalRows,
//       headers: result.finalHeaders,
//       steps: result.steps,
//       status: result.status,
//     });
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { executeAndLogPipeline } from "@/lib/executePipeline";
import { requireOwnerId } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    // const sendEmail = new URL(_req.url).searchParams.get("sendEmail") === "true";
    const sendEmail = new URL(_req.url).searchParams.get("sendEmail") === "true";
    const result = await executeAndLogPipeline(id, ownerId, undefined, sendEmail);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}