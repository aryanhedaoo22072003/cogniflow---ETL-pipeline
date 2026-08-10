import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Connection from "@/models/Connection";
import { testConnection } from "@/lib/connectors";
import { requireOwnerId } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const conn = await Connection.findById(id);
    if (!conn || conn.ownerId !== ownerId) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    const result = await testConnection({ type: conn.type, ...conn.config });
    conn.lastStatus = result.ok ? "ok" : "error";
    conn.lastError = result.error || "";
    conn.lastTestedAt = new Date();
    await conn.save();
    return NextResponse.json({ connection: conn, testResult: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}