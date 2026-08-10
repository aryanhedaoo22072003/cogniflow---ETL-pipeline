import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Connection from "@/models/Connection";
import { requireOwnerId } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Connection.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await Connection.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}