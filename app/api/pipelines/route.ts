import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";

// TODO: once Clerk (or your auth of choice) is wired up, replace this with
// the real signed-in user id, e.g. `const { userId } = auth();`
const DEV_OWNER_ID = "anonymous";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const env = req.nextUrl.searchParams.get("environment") || undefined;
    const query: Record<string, any> = { ownerId: DEV_OWNER_ID };
    if (env) query.environment = env;
    const pipelines = await Pipeline.find(query).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ pipelines });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, pipelines: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const pipeline = await Pipeline.create({
      name: body.name || "Untitled pipeline",
      ownerId: DEV_OWNER_ID,
      environment: body.environment || "DEV",
      headers: body.headers || [],
      nodes: body.nodes || [],
    });
    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}