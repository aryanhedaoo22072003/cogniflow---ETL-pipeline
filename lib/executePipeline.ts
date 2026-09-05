// import Pipeline from "@/models/Pipeline";
// import PipelineConnection from "@/models/Connection";
// import Run from "@/models/Run";
// import AlertSettings from "@/models/AlertSettings";
// import { runPipeline, PipelineNode } from "@/lib/transforms";
// import { fetchConnectionData, writeToConnection } from "@/lib/connectors";
// import { sendSlackAlert, formatFailureMessage } from "@/lib/alerts";
// import { sendMail, buildRunEmail } from "@/lib/mailer";
// import { connectDB } from "@/lib/mongodb";

// export async function executeAndLogPipeline(
//   pipelineId: string,
//   ownerId: string,
//   contextLabel?: string,
//   sendEmailAlert: boolean = false
// ) {
//   await connectDB();

//   const pipeline = await Pipeline.findById(pipelineId).lean<any>();
//   if (!pipeline || pipeline.ownerId !== ownerId) {
//     throw new Error(`Pipeline ${pipelineId} not found`);
//   }

//   const nodes: PipelineNode[] = await Promise.all(
//     pipeline.nodes.map(async (n: any) => {
//       if (n.type === "source" && n.config?.connectionId && !n.config?.rows?.length) {
//         const conn = await PipelineConnection.findById(n.config.connectionId).lean<any>();
//         if (!conn || conn.ownerId !== ownerId) return n;
//         const result = await fetchConnectionData({ type: conn.type, ...conn.config });
//         return {
//           ...n,
//           config: {
//             ...n.config,
//             rows: result.rows,
//             headers: result.headers,
//             connectionName: conn.name,
//             fetchError: result.ok ? null : result.error,
//           },
//         };
//       }
//       return n;
//     })
//   );

//   const { topoSort, autoWire } = await import("@/lib/graphUtils");
//   const pipelineEdges = pipeline.edges?.length ? pipeline.edges : autoWire(nodes);
//   const orderedNodes = topoSort(nodes, pipelineEdges);

//   const start = Date.now();
//   const sourceNode = orderedNodes.find((n: PipelineNode) => n.type === "source");
//   const initialRows = sourceNode?.config?.rows || [];
//   const initialHeaders = sourceNode?.config?.headers || Object.keys(initialRows[0] || {});
//   const result = await runPipeline(initialRows, initialHeaders, orderedNodes);

//   // Write to target connection if configured
//   const targetNode = nodes.find((n) => n.type === "target" && n.config?.connectionId);
//   if (targetNode && result.status === "success") {
//     const conn = await PipelineConnection.findById(targetNode.config.connectionId).lean<any>();
//     if (conn && conn.ownerId === ownerId) {
//       const writeResult = await writeToConnection(
//         { type: conn.type, ...conn.config },
//         result.finalRows,
//         result.finalHeaders,
//         { table: targetNode.config.table, mode: targetNode.config.writeMode || "insert" }
//       );
//       result.steps.push({
//         nodeId: targetNode.id,
//         label: `Write to ${conn.name}`,
//         ok: writeResult.ok,
//         message: writeResult.ok
//           ? `wrote ${writeResult.rowsWritten} rows to ${targetNode.config.table}`
//           : `write failed: ${writeResult.error}`,
//         rowsIn: result.finalRows.length,
//         rowsOut: writeResult.rowsWritten,
//       });
//       if (!writeResult.ok) result.status = "failed";
//     }
//   }

//   const durationMs = Date.now() - start;
//   const triggeredAt = new Date();

//   const run = await Run.create({
//     pipelineId,
//     pipelineName: contextLabel ? `${pipeline.name} ${contextLabel}` : pipeline.name,
//     ownerId,
//     environment: pipeline.environment,
//     status: result.status,
//     rowsIn: result.steps[0]?.rowsOut ?? 0,
//     rowsOut: result.finalRows.length,
//     durationMs,
//     steps: result.steps,
//   });

//   // ── Alerts ──────────────────────────────────────────────────────────────
//   const settings = await AlertSettings.findOne({ ownerId }).lean<any>();

//   // Slack — failure only
//   if (result.status === "failed" && settings?.enabled && settings.slackWebhookUrl) {
//     const failedStep = result.steps.find((s: any) => !s.ok);
//     const message = formatFailureMessage({
//       pipelineName: pipeline.name,
//       environment: pipeline.environment,
//       context: contextLabel || "direct run",
//       errorSummary: failedStep ? `${failedStep.label}: ${failedStep.message}` : "Unknown error",
//       timestamp: triggeredAt,
//     });
//     try { await sendSlackAlert(settings.slackWebhookUrl, message); } catch { /* swallow */ }
//   }

//   // Email alert logic
//   const emailEnabled = settings?.emailEnabled === true;
//   const emailTo = settings?.alertEmail || process.env.ALERT_EMAIL_TO;
//   const shouldEmailOnFailure = settings?.emailOnFailure !== false; // default true
//   const shouldEmailOnSuccess = settings?.emailOnSuccess !== false; // default true

//   const shouldSendEmail =
//     emailEnabled &&
//     emailTo &&
//     (
//       (result.status === "failed" && shouldEmailOnFailure) ||
//       (result.status === "success" && sendEmailAlert && shouldEmailOnSuccess)
//     );

//   console.log(`[executePipeline] email debug: emailEnabled=${emailEnabled}, emailTo=${emailTo}, status=${result.status}, sendEmailAlert=${sendEmailAlert}, shouldSendEmail=${shouldSendEmail}`);

//   if (shouldSendEmail) {
//     try {
//       const html = buildRunEmail({
//         pipelineName: pipeline.name,
//         environment: pipeline.environment,
//         status: result.status,
//         rowsIn: result.steps[0]?.rowsOut ?? 0,
//         rowsOut: result.finalRows.length,
//         durationMs,
//         steps: result.steps,
//         context: contextLabel,
//         triggeredAt,
//       });
//       const mailResult = await sendMail({
//         to: emailTo,
//         subject: `CogniFlow · ${result.status === "success" ? "✓" : "✗"} ${pipeline.name} — ${pipeline.environment}`,
//         html,
//       });
//       console.log(`[executePipeline] email result:`, mailResult);
//     } catch (err) {
//       console.error("[executePipeline] Email alert failed:", err);
//     }
//   }

//   return {
//     pipelineId,
//     pipelineName: pipeline.name,
//     run,
//     rows: result.finalRows,
//     headers: result.finalHeaders,
//     steps: result.steps,
//     status: result.status,
//     durationMs,
//   };
// }


import Pipeline from "@/models/Pipeline";
import PipelineConnection from "@/models/Connection";
import Run from "@/models/Run";
import AlertSettings from "@/models/AlertSettings";
import { runPipeline, PipelineNode } from "@/lib/transforms";
import { fetchConnectionData, writeToConnection } from "@/lib/connectors";
import { sendSlackAlert, formatFailureMessage } from "@/lib/alerts";
import { sendMail, buildRunEmail } from "@/lib/mailer";
import { createNotification } from "@/lib/notifications";
import { connectDB } from "@/lib/mongodb";

export async function executeAndLogPipeline(
  pipelineId: string,
  ownerId: string,
  contextLabel?: string,
  sendEmailAlert: boolean = false
) {
  await connectDB();

  const pipeline = await Pipeline.findById(pipelineId).lean<any>();
  if (!pipeline || pipeline.ownerId !== ownerId) {
    throw new Error(`Pipeline ${pipelineId} not found`);
  }

  const nodes: PipelineNode[] = await Promise.all(
    pipeline.nodes.map(async (n: any) => {
      if (n.type === "source" && n.config?.connectionId && !n.config?.rows?.length) {
        const conn = await PipelineConnection.findById(n.config.connectionId).lean<any>();
        if (!conn || conn.ownerId !== ownerId) return n;
        const result = await fetchConnectionData({ type: conn.type, ...conn.config });
        return {
          ...n,
          config: {
            ...n.config,
            rows: result.rows,
            headers: result.headers,
            connectionName: conn.name,
            fetchError: result.ok ? null : result.error,
          },
        };
      }
      return n;
    })
  );

  const { topoSort, autoWire } = await import("@/lib/graphUtils");
  const pipelineEdges = pipeline.edges?.length ? pipeline.edges : autoWire(nodes);
  const orderedNodes = topoSort(nodes, pipelineEdges);

  const start = Date.now();
  const sourceNode = orderedNodes.find((n: PipelineNode) => n.type === "source");
  const initialRows = sourceNode?.config?.rows || [];
  const initialHeaders = sourceNode?.config?.headers || Object.keys(initialRows[0] || {});
  const result = await runPipeline(initialRows, initialHeaders, orderedNodes);

  // Write to target connection if configured
  const targetNode = nodes.find((n) => n.type === "target" && n.config?.connectionId);
  if (targetNode && result.status === "success") {
    const conn = await PipelineConnection.findById(targetNode.config.connectionId).lean<any>();
    if (conn && conn.ownerId === ownerId) {
      const writeResult = await writeToConnection(
        { type: conn.type, ...conn.config },
        result.finalRows,
        result.finalHeaders,
        { table: targetNode.config.table, mode: targetNode.config.writeMode || "insert" }
      );
      result.steps.push({
        nodeId: targetNode.id,
        label: `Write to ${conn.name}`,
        ok: writeResult.ok,
        message: writeResult.ok
          ? `wrote ${writeResult.rowsWritten} rows to ${targetNode.config.table}`
          : `write failed: ${writeResult.error}`,
        rowsIn: result.finalRows.length,
        rowsOut: writeResult.rowsWritten,
      });
      if (!writeResult.ok) result.status = "failed";
    }
  }

  const durationMs = Date.now() - start;
  const triggeredAt = new Date();

  const run = await Run.create({
    pipelineId,
    pipelineName: contextLabel ? `${pipeline.name} ${contextLabel}` : pipeline.name,
    ownerId,
    environment: pipeline.environment,
    status: result.status,
    rowsIn: result.steps[0]?.rowsOut ?? 0,
    rowsOut: result.finalRows.length,
    durationMs,
    steps: result.steps,
  });

  // ── In-app notification ──────────────────────────────────────────────────
  const isScheduled = contextLabel?.includes("Scheduled") || contextLabel?.includes("Taskflow");
  const fmt = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

  if (result.status === "success" && isScheduled) {
    await createNotification({
      ownerId,
      type: "run_success",
      title: `${pipeline.name} completed`,
      message: `${result.finalRows.length.toLocaleString()} rows processed in ${fmt(durationMs)}`,
      pipelineId,
      pipelineName: pipeline.name,
      metadata: { durationMs, rowsOut: result.finalRows.length, environment: pipeline.environment },
    });
  }

  if (result.status === "failed") {
    const failedStep = result.steps.find((s: any) => !s.ok);
    await createNotification({
      ownerId,
      type: "run_failed",
      title: `${pipeline.name} failed`,
      message: failedStep ? `Failed at "${failedStep.label}": ${failedStep.message}` : "Pipeline run failed",
      pipelineId,
      pipelineName: pipeline.name,
      metadata: { environment: pipeline.environment, failedStep: failedStep?.label },
    });
  }

  // ── Slack alert ──────────────────────────────────────────────────────────
  const settings = await AlertSettings.findOne({ ownerId }).lean<any>();

  if (result.status === "failed" && settings?.enabled && settings.slackWebhookUrl) {
    const failedStep = result.steps.find((s: any) => !s.ok);
    const message = formatFailureMessage({
      pipelineName: pipeline.name,
      environment: pipeline.environment,
      context: contextLabel || "direct run",
      errorSummary: failedStep ? `${failedStep.label}: ${failedStep.message}` : "Unknown error",
      timestamp: triggeredAt,
    });
    try { await sendSlackAlert(settings.slackWebhookUrl, message); } catch { }
  }

  // ── Email alert ──────────────────────────────────────────────────────────
  const emailEnabled = settings?.emailEnabled === true;
  const emailTo = settings?.alertEmail || process.env.ALERT_EMAIL_TO;
  const shouldEmailOnFailure = settings?.emailOnFailure !== false;
  const shouldEmailOnSuccess = settings?.emailOnSuccess !== false;

  const shouldSendEmail =
    emailEnabled &&
    emailTo &&
    (
      (result.status === "failed" && shouldEmailOnFailure) ||
      (result.status === "success" && sendEmailAlert && shouldEmailOnSuccess)
    );

  console.log(`[executePipeline] email debug: emailEnabled=${emailEnabled}, emailTo=${emailTo}, status=${result.status}, sendEmailAlert=${sendEmailAlert}, shouldSendEmail=${shouldSendEmail}`);

  if (shouldSendEmail) {
    try {
      const html = buildRunEmail({
        pipelineName: pipeline.name,
        environment: pipeline.environment,
        status: result.status,
        rowsIn: result.steps[0]?.rowsOut ?? 0,
        rowsOut: result.finalRows.length,
        durationMs,
        steps: result.steps,
        context: contextLabel,
        triggeredAt,
      });
      const mailResult = await sendMail({
        to: emailTo,
        subject: `CogniFlow · ${result.status === "success" ? "✓" : "✗"} ${pipeline.name} — ${pipeline.environment}`,
        html,
      });
      console.log(`[executePipeline] email result:`, mailResult);
    } catch (err) {
      console.error("[executePipeline] Email alert failed:", err);
    }
  }

  return {
    pipelineId,
    pipelineName: pipeline.name,
    run,
    rows: result.finalRows,
    headers: result.finalHeaders,
    steps: result.steps,
    status: result.status,
    durationMs,
  };
}