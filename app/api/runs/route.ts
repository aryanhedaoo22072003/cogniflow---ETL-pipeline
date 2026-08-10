import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Run from "@/models/Run";
import { requireOwnerId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const runs = await Run.find({ ownerId }).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ runs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, runs: [] }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}