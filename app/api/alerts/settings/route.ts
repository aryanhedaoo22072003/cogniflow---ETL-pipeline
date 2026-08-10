import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AlertSettings from "@/models/AlertSettings";
import { requireOwnerId } from "@/lib/auth";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const settings = await AlertSettings.findOne({ ownerId }).lean();
    return NextResponse.json({ settings: settings || { slackWebhookUrl: "", enabled: false } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const settings = await AlertSettings.findOneAndUpdate(
      { ownerId },
      { slackWebhookUrl: body.slackWebhookUrl || "", enabled: !!body.enabled },
      { upsert: true, new: true }
    );
    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}