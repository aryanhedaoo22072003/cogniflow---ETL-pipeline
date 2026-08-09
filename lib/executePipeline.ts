// import Pipeline from "@/models/Pipeline";
// import PipelineConnection from "@/models/Connection";
// import Run from "@/models/Run";
// import AlertSettings from "@/models/AlertSettings";
// import { runPipeline, PipelineNode } from "@/lib/transforms";
// import { fetchConnectionData, writeToConnection } from "@/lib/connectors";
// import { sendSlackAlert, formatFailureMessage } from "@/lib/alerts";

// const DEV_OWNER_ID = "anonymous";

// export async function executeAndLogPipeline(pipelineId: string, contextLabel?: string) {
//   const pipeline = await Pipeline.findById(pipelineId).lean<any>();
//   if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

//   const nodes: PipelineNode[] = await Promise.all(
//     pipeline.nodes.map(async (n: any) => {
//       if (n.type === "source" && n.config?.connectionId && !n.config?.rows?.length) {
//         const conn = await PipelineConnection.findById(n.config.connectionId).lean<any>();
//         if (!conn) return n;
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

//   const start = Date.now();
//   const result = runPipeline([], [], nodes);

//   // If there's a Target node configured to write to a real connection, do that now.
//   const targetNode = nodes.find((n) => n.type === "target" && n.config?.connectionId);
//   if (targetNode && result.status === "success") {
//     const conn = await PipelineConnection.findById(targetNode.config.connectionId).lean<any>();
//     if (conn) {
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
//   const run = await Run.create({
//     pipelineId,
//     pipelineName: contextLabel ? `${pipeline.name} ${contextLabel}` : pipeline.name,
//     ownerId: DEV_OWNER_ID,
//     environment: pipeline.environment,
//     status: result.status,
//     rowsIn: result.steps[0]?.rowsOut ?? 0,
//     rowsOut: result.finalRows.length,
//     durationMs,
//     steps: result.steps,
//   });

//   // Fire a Slack alert on failure — single choke point, covers direct runs,
//   // Taskflow steps, and Schedules alike since they all call this function.
//   if (result.status === "failed") {
//     const settings = await AlertSettings.findOne({ ownerId: DEV_OWNER_ID }).lean<any>();
//     if (settings?.enabled && settings.slackWebhookUrl) {
//       const failedStep = result.steps.find((s) => !s.ok);
//       const message = formatFailureMessage({
//         pipelineName: pipeline.name,
//         environment: pipeline.environment,
//         context: contextLabel || "direct run",
//         errorSummary: failedStep ? `${failedStep.label}: ${failedStep.message}` : "Unknown error",
//         timestamp: new Date(),
//       });
//       // Awaited (not fire-and-forget) because serverless functions can be frozen right
//       // after the response is sent — an un-awaited request might never actually go out.
//       // Still wrapped so a Slack outage can't fail the pipeline run itself.
//       try {
//         await sendSlackAlert(settings.slackWebhookUrl, message);
//       } catch {
//         // swallow — alerting failures shouldn't affect pipeline run status
//       }
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

/**
 * Executes a saved pipeline and logs the run. `ownerId` is required and is
 * always checked against the pipeline's own stored owner — this is the one
 * place that would let one signed-in user run another user's pipeline if it
 * were skipped, since pipelineId alone isn't secret (Mongo ObjectIds are
 * guessable/enumerable, not access tokens).
 */
export async function executeAndLogPipeline(pipelineId: string, ownerId: string, contextLabel?: string) {
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

  const start = Date.now();
  const result = runPipeline([], [], nodes);

  // If there's a Target node configured to write to a real connection, do that now.
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

  // Fire a Slack alert on failure — single choke point, covers direct runs,
  // Taskflow steps, and Schedules alike since they all call this function.
  if (result.status === "failed") {
    const settings = await AlertSettings.findOne({ ownerId }).lean<any>();
    if (settings?.enabled && settings.slackWebhookUrl) {
      const failedStep = result.steps.find((s) => !s.ok);
      const message = formatFailureMessage({
        pipelineName: pipeline.name,
        environment: pipeline.environment,
        context: contextLabel || "direct run",
        errorSummary: failedStep ? `${failedStep.label}: ${failedStep.message}` : "Unknown error",
        timestamp: new Date(),
      });
      try {
        await sendSlackAlert(settings.slackWebhookUrl, message);
      } catch {
        // swallow — alerting failures shouldn't affect pipeline run status
      }
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
