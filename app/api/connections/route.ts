import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Connection from "@/models/Connection";
import { testConnection } from "@/lib/connectors";
import { requireOwnerId } from "@/lib/auth";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const connections = await Connection.find({ ownerId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ connections });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, connections: [] }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const result = await testConnection({ type: body.type, ...body.config });
    const connection = await Connection.create({
      name: body.name,
      ownerId,
      type: body.type,
      config: body.config,
      lastStatus: result.ok ? "ok" : "error",
      lastError: result.error || "",
      lastTestedAt: new Date(),
    });
    return NextResponse.json({ connection, testResult: result }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}