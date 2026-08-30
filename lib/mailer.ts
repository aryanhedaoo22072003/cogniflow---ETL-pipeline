import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });
}

export interface MailOptions { to?: string; subject: string; html: string; }

export async function sendMail({ to, subject, html }: MailOptions) {
  const transporter = createTransporter();
  const recipient = to || process.env.ALERT_EMAIL_TO;
  if (!recipient) return { ok: false, error: "No recipient configured" };
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return { ok: false, error: "SMTP not configured" };
  try {
    await transporter.sendMail({ from: `"CogniFlow" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`, to: recipient, subject, html });
    return { ok: true };
  } catch (err: any) {
    console.error("[mailer]", err.message);
    return { ok: false, error: err.message };
  }
}

function fmt(ms: number) { return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`; }

export function buildRunEmail({ pipelineName, environment, status, rowsIn, rowsOut, durationMs, steps, context, triggeredAt }: {
  pipelineName: string; environment: string; status: "success" | "failed";
  rowsIn: number; rowsOut: number; durationMs: number;
  steps: { label: string; ok: boolean; message: string; rowsOut?: number }[];
  context?: string; triggeredAt: Date;
}) {
  const isSuccess = status === "success";
  const statusColor = isSuccess ? "#1FA971" : "#DA4B4B";
  const failedStep = steps.find(s => !s.ok);
  const stepsHtml = steps.map(s => `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-family:monospace;font-size:12px;color:${s.ok ? "#1FA971" : "#DA4B4B"}">${s.ok ? "✓" : "✗"}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:13px;color:#1A2233">${s.label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:12px;color:#6B7385;font-family:monospace">${s.message}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:12px;color:#9AA1B2;font-family:monospace">${s.rowsOut ?? "—"} rows</td>
  </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#0B1220,#1B2740);padding:28px 32px">
    <div style="color:#5EEAD4;font-size:11px;font-family:monospace;letter-spacing:0.1em;margin-bottom:8px">COGNIFLOW · PIPELINE ALERT</div>
    <div style="color:white;font-size:22px;font-weight:700">${pipelineName}</div>
    <div style="color:#8B93AC;font-size:13px;margin-top:4px">${context ? `${context} · ` : ""}${environment}</div>
  </div>
  <div style="background:${isSuccess ? "#F0FBF6" : "#FEF2F2"};border-bottom:1px solid ${statusColor}22;padding:16px 32px">
    <div style="font-size:16px;font-weight:700;color:${statusColor}">${isSuccess ? "✓ Succeeded" : "✗ Failed"}</div>
    <div style="font-size:12px;color:#6B7385;margin-top:2px">${triggeredAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
  </div>
  <div style="display:flex;border-bottom:1px solid #F0F2F6">
    ${[["Rows in", rowsIn.toLocaleString()], ["Rows out", rowsOut.toLocaleString()], ["Duration", fmt(durationMs)], ["Steps", steps.length.toString()]].map(([l, v]) =>
      `<div style="flex:1;padding:16px;text-align:center;border-right:1px solid #F0F2F6"><div style="font-size:18px;font-weight:700;color:#1A2233;font-family:monospace">${v}</div><div style="font-size:11px;color:#9AA1B2;margin-top:2px;text-transform:uppercase">${l}</div></div>`
    ).join("")}
  </div>
  ${!isSuccess && failedStep ? `<div style="background:#FEF2F2;border-left:4px solid #DA4B4B;margin:20px 32px;border-radius:6px;padding:14px 16px"><div style="font-size:12px;font-weight:600;color:#DA4B4B;margin-bottom:4px">Failed at: ${failedStep.label}</div><div style="font-size:12px;color:#6B7385;font-family:monospace">${failedStep.message}</div></div>` : ""}
  <div style="padding:20px 32px">
    <div style="font-size:12px;font-weight:600;color:#9AA1B2;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Execution steps</div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #F0F2F6;border-radius:8px;overflow:hidden">
      <thead><tr style="background:#FAFBFD">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6;width:30px"></th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">Step</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">Message</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">Output</th>
      </tr></thead>
      <tbody>${stepsHtml}</tbody>
    </table>
  </div>
  <div style="background:#FAFBFD;border-top:1px solid #F0F2F6;padding:16px 32px;text-align:center">
    <div style="font-size:11px;color:#9AA1B2">CogniFlow · Data Engineering Platform</div>
  </div>
</div></body></html>`;
}

export function buildTaskflowEmail({ taskflowName, status, pipelineResults, durationMs, triggeredAt }: {
  taskflowName: string; status: "success" | "failed";
  pipelineResults: { pipelineName: string; status: string; rowsOut: number; durationMs: number }[];
  durationMs: number; triggeredAt: Date;
}) {
  const isSuccess = status === "success";
  const statusColor = isSuccess ? "#1FA971" : "#DA4B4B";
  const rows = pipelineResults.map((p, i) => `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:12px;color:#9AA1B2">${i + 1}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:13px;color:#1A2233">${p.pipelineName}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:12px;font-weight:600;color:${p.status === "success" ? "#1FA971" : "#DA4B4B"}">${p.status}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #F0F2F6;font-size:12px;color:#9AA1B2;font-family:monospace">${p.rowsOut.toLocaleString()} rows · ${fmt(p.durationMs)}</td>
  </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#0B1220,#1B2740);padding:28px 32px">
    <div style="color:#5EEAD4;font-size:11px;font-family:monospace;letter-spacing:0.1em;margin-bottom:8px">COGNIFLOW · TASKFLOW ALERT</div>
    <div style="color:white;font-size:22px;font-weight:700">${taskflowName}</div>
    <div style="color:#8B93AC;font-size:13px;margin-top:4px">Scheduled run · ${triggeredAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
  </div>
  <div style="background:${isSuccess ? "#F0FBF6" : "#FEF2F2"};border-bottom:1px solid ${statusColor}22;padding:16px 32px">
    <div style="font-size:16px;font-weight:700;color:${statusColor}">${isSuccess ? "✓ All pipelines succeeded" : "✗ One or more pipelines failed"}</div>
    <div style="font-size:12px;color:#6B7385;margin-top:4px">${pipelineResults.length} pipelines · ${fmt(durationMs)} total</div>
  </div>
  <div style="padding:20px 32px">
    <table style="width:100%;border-collapse:collapse;border:1px solid #F0F2F6;border-radius:8px;overflow:hidden">
      <thead><tr style="background:#FAFBFD">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">#</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">Pipeline</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">Status</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9AA1B2;border-bottom:1px solid #F0F2F6">Output</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="background:#FAFBFD;border-top:1px solid #F0F2F6;padding:16px 32px;text-align:center">
    <div style="font-size:11px;color:#9AA1B2">CogniFlow · Data Engineering Platform</div>
  </div>
</div></body></html>`;
}