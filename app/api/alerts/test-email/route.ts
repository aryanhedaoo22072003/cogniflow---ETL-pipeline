import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ ok: false, error: "No email provided" }, { status: 400 });
  const result = await sendMail({
    to: email,
    subject: "CogniFlow · Test alert email ✓",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;border:1px solid #E3E7EF;border-radius:12px">
      <div style="font-size:11px;color:#9AA1B2;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">CogniFlow · Test</div>
      <h2 style="color:#1A2233;margin:0 0 12px">Email alerts are working ✓</h2>
      <p style="color:#6B7385;font-size:13px;line-height:1.6">Your SMTP settings are configured correctly. You will receive alerts like this when your scheduled pipelines and taskflows run.</p>
      <div style="background:#F4F6FA;border-radius:8px;padding:12px;margin-top:16px;font-family:monospace;font-size:11px;color:#9AA1B2">SMTP OK · Email alerts enabled</div>
    </div>`,
  });
  return NextResponse.json(result);
}
