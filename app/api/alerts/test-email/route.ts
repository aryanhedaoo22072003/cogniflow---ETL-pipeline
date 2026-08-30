import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  await requireOwnerId();
  const { email } = await req.json();

  if (!email) return NextResponse.json({ ok: false, error: "No email provided" }, { status: 400 });

  const result = await sendMail({
    to: email,
    subject: "CogniFlow · Test alert email",
    html: `
      <div style="max-width:480px;margin:40px auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;border:1px solid #E3E7EF;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0B1220,#1B2740);padding:24px 28px">
          <div style="color:#5EEAD4;font-size:11px;font-family:monospace;letter-spacing:0.1em;margin-bottom:6px">COGNIFLOW · TEST</div>
          <div style="color:white;font-size:20px;font-weight:700">Email alerts are working ✓</div>
        </div>
        <div style="padding:24px 28px">
          <p style="color:#6B7385;font-size:13px;line-height:1.6">
            This is a test alert from CogniFlow. Your email notifications are configured correctly.
            You'll receive alerts like this when your scheduled pipelines and taskflows run.
          </p>
          <div style="background:#F4F6FA;border-radius:8px;padding:14px;margin-top:16px">
            <div style="font-size:12px;color:#9AA1B2;font-family:monospace">
              SMTP configured · Email alerts enabled · Ready to notify
            </div>
          </div>
        </div>
        <div style="background:#FAFBFD;border-top:1px solid #F0F2F6;padding:14px 28px;text-align:center">
          <div style="font-size:11px;color:#9AA1B2">CogniFlow · Data Engineering Platform</div>
        </div>
      </div>
    `,
  });

  return NextResponse.json(result);
}