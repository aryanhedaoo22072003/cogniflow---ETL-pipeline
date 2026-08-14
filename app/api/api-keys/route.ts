import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ApiKey, { generateApiKey } from "@/models/ApiKey";
import { requireOwnerId } from "@/lib/auth";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const keys = await ApiKey.find({ ownerId })
      .select("name keyPrefix enabled lastUsedAt createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ keys });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Key name is required" }, { status: 400 });

    const existing = await ApiKey.countDocuments({ ownerId });
    if (existing >= 10) {
      return NextResponse.json({ error: "Maximum 10 API keys per workspace" }, { status: 400 });
    }

    const { raw, hash, prefix } = generateApiKey();
    await ApiKey.create({
      ownerId,
      name: body.name.trim(),
      keyHash: hash,
      keyPrefix: prefix,
      enabled: true,
    });

    return NextResponse.json({ rawKey: raw, prefix }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}