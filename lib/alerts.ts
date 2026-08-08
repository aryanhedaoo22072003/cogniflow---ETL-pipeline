export interface FailureAlertPayload {
  pipelineName: string;
  environment: string;
  context: string; // e.g. "direct run", "Taskflow: Daily refresh", "Scheduled"
  errorSummary: string;
  timestamp: Date;
}

export async function sendSlackAlert(webhookUrl: string, text: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Slack returned ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export function formatFailureMessage(payload: FailureAlertPayload): string {
  return [
    `🔴 *Pipeline failed* — ${payload.pipelineName}`,
    `*Environment:* ${payload.environment}`,
    `*Context:* ${payload.context}`,
    `*Error:* ${payload.errorSummary}`,
    `*Time:* ${payload.timestamp.toLocaleString()}`,
  ].join("\n");
}