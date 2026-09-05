import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

// PATCH /api/notifications/[id] — mark one as read
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();
  await Notification.findOneAndUpdate({ _id: id, ownerId }, { read: true });
  return NextResponse.json({ ok: true });
}

// DELETE /api/notifications/[id] — delete one
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  await connectDB();
  await Notification.findOneAndDelete({ _id: id, ownerId });
  return NextResponse.json({ ok: true });
}