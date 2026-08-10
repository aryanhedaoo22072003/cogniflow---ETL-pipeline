import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AlertSettings from "@/models/AlertSettings";
import { sendSlackAlert } from "@/lib/alerts";
import { requireOwnerId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const webhookUrl = body.slackWebhookUrl;
    if (!webhookUrl) return NextResponse.json({ ok: false, error: "No webhook URL provided" }, { status: 400 });

    const result = await sendSlackAlert(
      webhookUrl,
      "✅ *CogniFlow test alert* — if you're seeing this in Slack, failure alerts are wired up correctly."
    );

    await AlertSettings.findOneAndUpdate(
      { ownerId },
      { lastTestAt: new Date(), lastTestOk: result.ok },
      { upsert: true }
    );

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}