import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AlertSettings from "@/models/AlertSettings";

/**
 * GET /api/alerts/debug
 * Shows exactly what's configured so you can diagnose why email isn't sending.
 * Remove this file before going to production.
 */
export async function GET() {
  const ownerId = await requireOwnerId();
  await connectDB();

  const settings = await AlertSettings.findOne({ ownerId }).lean<any>();

  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  return NextResponse.json({
    // Alert settings from DB
    dbSettings: {
      emailEnabled: settings?.emailEnabled ?? "NOT SET",
      alertEmail: settings?.alertEmail ? `${settings.alertEmail.slice(0, 4)}***` : "NOT SET",
      emailOnSuccess: settings?.emailOnSuccess ?? "NOT SET",
      emailOnFailure: settings?.emailOnFailure ?? "NOT SET",
      slackEnabled: settings?.enabled ?? "NOT SET",
    },
    // SMTP env vars (values masked)
    smtpEnv: {
      SMTP_HOST: process.env.SMTP_HOST || "NOT SET",
      SMTP_PORT: process.env.SMTP_PORT || "NOT SET",
      SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 4)}***` : "NOT SET",
      SMTP_PASS: process.env.SMTP_PASS ? "SET (hidden)" : "NOT SET",
      SMTP_FROM: process.env.SMTP_FROM || "NOT SET",
      ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO ? `${process.env.ALERT_EMAIL_TO.slice(0, 4)}***` : "NOT SET",
      CRON_SECRET: process.env.CRON_SECRET ? "SET (hidden)" : "NOT SET",
    },
    smtpConfigured,
    // What would happen if a pipeline ran now
    wouldSendEmail: settings?.emailEnabled && settings?.alertEmail && smtpConfigured,
  });
}