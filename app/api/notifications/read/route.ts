import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

// PATCH /api/notifications/read — mark all as read
export async function PATCH() {
  const ownerId = await requireOwnerId();
  await connectDB();
  await Notification.updateMany({ ownerId, read: false }, { read: true });
  return NextResponse.json({ ok: true });
}