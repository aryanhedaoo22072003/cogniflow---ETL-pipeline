import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AlertSettings from "@/models/AlertSettings";

export async function GET() {
  const ownerId = await requireOwnerId();
await connectDB();
  const settings = await AlertSettings.findOne({ ownerId }).lean();
  return NextResponse.json({ settings: settings || {} });
}

export async function POST(req: Request) {
  const ownerId = await requireOwnerId();
await connectDB();
  const body = await req.json();

  const settings = await AlertSettings.findOneAndUpdate(
    { ownerId },
    {
      enabled: body.enabled ?? false,
      slackWebhookUrl: body.slackWebhookUrl || "",
      emailEnabled: body.emailEnabled ?? false,
      alertEmail: body.alertEmail || "",
      emailOnSuccess: body.emailOnSuccess ?? true,
      emailOnFailure: body.emailOnFailure ?? true,
    },
    { upsert: true, new: true }
  );
  return NextResponse.json({ settings });
}