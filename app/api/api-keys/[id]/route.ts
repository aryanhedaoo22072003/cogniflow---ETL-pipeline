import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ApiKey from "@/models/ApiKey";
import { requireOwnerId } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const key = await ApiKey.findById(id).lean<any>();
    if (!key || key.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await ApiKey.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}