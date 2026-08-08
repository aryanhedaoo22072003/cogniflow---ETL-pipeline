import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AlertSettings from "@/models/AlertSettings";

const DEV_OWNER_ID = "anonymous";

export async function GET() {
  try {
    await connectDB();
    const settings = await AlertSettings.findOne({ ownerId: DEV_OWNER_ID }).lean();
    return NextResponse.json({ settings: settings || { slackWebhookUrl: "", enabled: false } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const settings = await AlertSettings.findOneAndUpdate(
      { ownerId: DEV_OWNER_ID },
      { slackWebhookUrl: body.slackWebhookUrl || "", enabled: !!body.enabled },
      { upsert: true, new: true }
    );
    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}