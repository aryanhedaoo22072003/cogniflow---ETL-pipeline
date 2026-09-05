import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

// GET /api/notifications — list all notifications
export async function GET() {
  const ownerId = await requireOwnerId();
  await connectDB();

  const notifications = await Notification.find({ ownerId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({ ownerId, read: false });

  return NextResponse.json({ notifications, unreadCount });
}

// DELETE /api/notifications — clear all
export async function DELETE() {
  const ownerId = await requireOwnerId();
  await connectDB();
  await Notification.deleteMany({ ownerId });
  return NextResponse.json({ ok: true });
}