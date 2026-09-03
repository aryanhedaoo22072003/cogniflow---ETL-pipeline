import { NextRequest } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import PipelineConnection from "@/models/Connection";
import Run from "@/models/Run";
import AlertSettings from "@/models/AlertSettings";
import { fetchConnectionData } from "@/lib/connectors";
import { sendMail, buildRunEmail } from "@/lib/mailer";
import type { PipelineNode } from "@/lib/transforms";

// GET /api/pipelines/[id]/run-stream
// Returns a Server-Sent Events stream with live step progress
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();

  const pipeline = await Pipeline.findById(id).lean<any>();
  if (!pipeline || pipeline.ownerId !== ownerId) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  function send(stream: ReadableStreamDefaultController, event: string, data: any) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    stream.enqueue(encoder.encode(msg));
  }

  const readable = new ReadableStream({
    async start(controller) {
      const start = Date.now();
      const steps: any[] = [];
      let finalRows: any[] = [];
      let finalHeaders: string[] = [];
      let status: "success" | "failed" = "success";

      try {
        send(controller, "start", { pipelineName: pipeline.name, totalNodes: pipeline.nodes.length });

        // Resolve connections
        const nodes: PipelineNode[] = await Promise.all(
          pipeline.nodes.map(async (n: any) => {
            if (n.type === "source" && n.config?.connectionId && !n.config?.rows?.length) {
              const conn = await PipelineConnection.findById(n.config.connectionId).lean<any>();
              if (!conn || conn.ownerId !== ownerId) return n;
              const result = await fetchConnectionData({ type: conn.type, ...conn.config });
              return { ...n, config: { ...n.config, rows: result.rows, headers: result.headers } };
            }
            return n;
          })
        );

        // Topological sort
        const { topoSort, autoWire } = await import("@/lib/graphUtils");
        const edges = pipeline.edges?.length ? pipeline.edges : autoWire(nodes);
        const orderedNodes = topoSort(nodes, edges);

        // Get initial rows from source
        const sourceNode = orderedNodes.find((n: PipelineNode) => n.type === "source");
        let rows = sourceNode?.config?.rows || [];
        let headers = sourceNode?.config?.headers || Object.keys(rows[0] || {});
        finalHeaders = headers;

        send(controller, "progress", {
          step: 0,
          label: sourceNode?.label || "Source",
          status: "running",
          rowsIn: 0,
          rowsOut: rows.length,
        });

        // Run each transform one by one, streaming progress
        const { applyTransform } = await import("@/lib/transforms");

        for (let i = 0; i < orderedNodes.length; i++) {
          const node = orderedNodes[i];
          if (node.type === "source") continue;

          const rowsIn = rows.length;
          send(controller, "progress", {
            step: i,
            label: node.label,
            status: "running",
            rowsIn,
            rowsOut: null,
          });

          try {
            const outcome = await applyTransform(rows, headers, node);
            rows = outcome.rows;
            headers = outcome.headers;
            finalRows = rows;
            finalHeaders = headers;

            const step = {
              nodeId: node.id,
              label: node.label,
              ok: outcome.ok,
              message: outcome.message,
              rowsIn,
              rowsOut: rows.length,
            };
            steps.push(step);
            if (!outcome.ok) status = "failed";

            send(controller, "progress", {
              step: i,
              label: node.label,
              status: outcome.ok ? "success" : "failed",
              rowsIn,
              rowsOut: rows.length,
              message: outcome.message,
            });
          } catch (err: any) {
            const step = { nodeId: node.id, label: node.label, ok: false, message: err.message, rowsIn, rowsOut: 0 };
            steps.push(step);
            status = "failed";
            send(controller, "progress", { step: i, label: node.label, status: "failed", rowsIn, rowsOut: 0, message: err.message });
          }
        }

        const durationMs = Date.now() - start;

        // Save run
        await Run.create({
          pipelineId: id,
          pipelineName: pipeline.name,
          ownerId,
          environment: pipeline.environment,
          status,
          rowsIn: steps[0]?.rowsOut ?? 0,
          rowsOut: finalRows.length,
          durationMs,
          steps,
        });

        // Email alert
        const alertSettings = await AlertSettings.findOne({ ownerId }).lean<any>();
        const emailTo = alertSettings?.alertEmail || process.env.ALERT_EMAIL_TO;
        if (alertSettings?.emailEnabled && emailTo && status === "failed" && alertSettings?.emailOnFailure !== false) {
          const html = buildRunEmail({ pipelineName: pipeline.name, environment: pipeline.environment, status, rowsIn: steps[0]?.rowsOut ?? 0, rowsOut: finalRows.length, durationMs, steps, triggeredAt: new Date() });
          await sendMail({ to: emailTo, subject: `CogniFlow · ✗ ${pipeline.name} failed`, html }).catch(() => {});
        }

        send(controller, "done", {
          status,
          durationMs,
          rowsOut: finalRows.length,
          headers: finalHeaders,
          rows: finalRows.slice(0, 100), // send first 100 rows for preview
          steps,
        });

      } catch (err: any) {
        send(controller, "error", { message: err.message });
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}