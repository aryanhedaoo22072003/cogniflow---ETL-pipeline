import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AlertSettings from "@/models/AlertSettings";

export async function GET() {
  const ownerId = await requireOwnerId();
  await connectDB();
  const settings = await AlertSettings.findOne({ ownerId }).lean<any>();
  return NextResponse.json({
    dbSettings: {
      emailEnabled: settings?.emailEnabled ?? "NOT SET",
      alertEmail: settings?.alertEmail ? settings.alertEmail.slice(0,4)+"***" : "NOT SET",
      emailOnSuccess: settings?.emailOnSuccess ?? "NOT SET",
      emailOnFailure: settings?.emailOnFailure ?? "NOT SET",
      slackEnabled: settings?.enabled ?? "NOT SET",
    },
    smtpEnv: {
      SMTP_HOST: process.env.SMTP_HOST || "NOT SET",
      SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.slice(0,4)+"***" : "NOT SET",
      SMTP_PASS: process.env.SMTP_PASS ? "SET" : "NOT SET",
      SMTP_FROM: process.env.SMTP_FROM || "NOT SET",
      ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO ? process.env.ALERT_EMAIL_TO.slice(0,4)+"***" : "NOT SET",
    },
    wouldSendEmail: !!(settings?.emailEnabled && settings?.alertEmail && process.env.SMTP_PASS),
  });
}
