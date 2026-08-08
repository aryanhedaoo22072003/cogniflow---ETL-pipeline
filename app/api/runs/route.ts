import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Run from "@/models/Run";

const DEV_OWNER_ID = "anonymous";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const runs = await Run.find({ ownerId: DEV_OWNER_ID }).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ runs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, runs: [] }, { status: 500 });
  }
}