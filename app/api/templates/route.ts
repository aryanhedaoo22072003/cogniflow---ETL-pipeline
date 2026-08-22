import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import { TEMPLATES } from "@/lib/templates";
import { requireOwnerId } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = await requireOwnerId();
    await connectDB();
    const body = await req.json();
    const template = TEMPLATES.find((t) => t.id === body.templateId);
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const nodes = template.steps.map((step, i) => ({
      id: `tmpl_${template.id}_${i}_${Date.now()}`,
      type: step.type,
      label: step.label,
      x: 40 + (i % 4) * 220,
      y: 30 + Math.floor(i / 4) * 150,
      config: step.config,
    }));

    const pipeline = await Pipeline.create({
      name: template.name,
      ownerId,
      environment: "DEV",
      headers: template.sampleHeaders,
      nodes,
      fromTemplate: template.id,
    });

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Not authenticated" ? 401 : 500 });
  }
}