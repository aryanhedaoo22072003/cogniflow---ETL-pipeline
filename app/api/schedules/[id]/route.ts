import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { requireOwnerId } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Schedule.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const schedule = await Schedule.findByIdAndUpdate(id, { enabled: body.enabled }, { new: true });
    return NextResponse.json({ schedule });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const existing = await Schedule.findById(id).lean<any>();
    if (!existing || existing.ownerId !== ownerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await Schedule.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}