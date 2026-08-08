import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const pipeline = await Pipeline.findById(id).lean();
    if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ pipeline });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const pipeline = await Pipeline.findByIdAndUpdate(
      id,
      { name: body.name, environment: body.environment, headers: body.headers, nodes: body.nodes },
      { new: true }
    );
    if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ pipeline });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    await Pipeline.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}