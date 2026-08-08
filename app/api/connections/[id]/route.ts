import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Connection from "@/models/Connection";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    await Connection.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}