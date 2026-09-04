import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  await requireOwnerId();
  const { profile, rowCount, headers } = await req.json();

  const profileText = profile.map((p: any) =>
    `- ${p.column}: ${p.nullPct}% nulls, ${p.unique} unique values, ${p.isNumeric ? "numeric" : "text"}, samples: [${p.sample.slice(0, 3).join(", ")}]`
  ).join("\n");

  const prompt = `You are a data engineering expert. Analyse this dataset profile and suggest data cleaning steps.

Dataset: ${rowCount} rows, ${headers.length} columns
Columns:
${profileText}

Return ONLY a JSON array of cleaning steps. Each step must have:
- type: one of "nulls", "dedupe", "filter", "expression", "rename", "normalizer"
- label: short name e.g. "Fill nulls in Age"
- description: what it does e.g. "Replace missing Age values with 0"
- config: the transform config object matching CogniFlow's transform schema
- impact: e.g. "Affects ~23% of rows (230 rows)"
- severity: "high" | "medium" | "low"

For nulls config use: { column, strategy: "fill_zero"|"fill_na"|"drop_row" }
For dedupe config use: {}
For filter config use: { column, op: "not_empty"|"gt"|"lt"|"eq", value }
For expression config use: { outputPorts: [{name, expr}] }

Return only valid JSON array, no markdown, no explanation.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });
    const text = completion.choices[0]?.message?.content || "[]";
    // Extract JSON array from response robustly
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ steps: [] });
    let clean = match[0];
    // Truncate to last complete object if unterminated
    const lastBrace = clean.lastIndexOf("}");
    if (lastBrace !== -1) clean = clean.slice(0, lastBrace + 1) + "]";
    const steps = JSON.parse(clean);
    return NextResponse.json({ steps: Array.isArray(steps) ? steps : [] });
  } catch (err: any) {
    console.error("[ai/clean]", err);
    return NextResponse.json({ steps: [] });
  }
}