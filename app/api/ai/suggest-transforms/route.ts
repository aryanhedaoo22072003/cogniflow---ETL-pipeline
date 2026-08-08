import { NextRequest, NextResponse } from "next/server";
import { profileColumns } from "@/lib/dataProfile";

const ALLOWED_TYPES = [
  "filter", "rename", "dedupe", "nulls", "expression", "sequence",
  "sorter", "rank", "aggregator", "normalizer",
];

const SYSTEM_PROMPT = `You are a data engineering assistant embedded in an ETL tool called CogniFlow.
You will be given a column profile (name, inferred type, null percentage, distinct count, sample values) for an uploaded dataset.

Suggest 2-5 concrete, useful pipeline transform steps a data engineer would actually add, based ONLY on what the profile shows — don't invent problems that aren't there.

Respond with ONLY a JSON array, no prose, no markdown fences. Each item must have this exact shape:
{
  "type": one of ["filter","rename","dedupe","nulls","expression","sequence","sorter","rank","aggregator","normalizer"],
  "reason": a short one-sentence explanation of why, referencing the actual column and its stats,
  "config": an object with the fields that transform type needs (see below)
}

Config fields per type:
- filter: { "column": string, "op": "not_empty"|"empty"|"gt"|"lt"|"eq"|"neq"|"contains", "value"?: string }
- rename: { "from": string, "to": string }
- dedupe: {}
- nulls: { "column": string, "strategy": "drop_row"|"fill_zero"|"fill_na" }
- expression: { "name": string, "expr": string }
- sequence: { "outputColumn": string, "startAt": number, "step": number }
- sorter: { "column": string, "direction": "asc"|"desc" }
- rank: { "column": string, "outputColumn": string, "direction": "asc"|"desc" }
- aggregator: { "groupBy": string, "targetColumn": string, "fn": "sum"|"avg"|"count"|"min"|"max" }
- normalizer: { "pivotColumns": string[], "nameColumn": string, "valueColumn": string, "keepColumns": string[] }

Only suggest "nulls" if null percentage is meaningfully high (over ~15%). Only suggest "dedupe" if it seems genuinely likely to help (don't suggest it reflexively). Prefer suggestions clearly grounded in the actual profile data over generic advice.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env.local." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const rows: Record<string, any>[] = body.rows || [];
    const headers: string[] = body.headers || [];
    if (rows.length === 0 || headers.length === 0) {
      return NextResponse.json({ error: "No data to profile" }, { status: 400 });
    }

    const profiles = profileColumns(rows, headers);
    const profileSummary = profiles.map((p) => ({
      column: p.name,
      type: p.type,
      nullPct: p.nullPct,
      distinctCount: p.distinctCount,
      min: p.min,
      max: p.max,
      avg: p.avg,
      topValues: p.topValues?.map((t) => t.value),
    }));

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Column profile (${rows.length} rows sampled):\n${JSON.stringify(profileSummary, null, 2)}` },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Groq API error: ${errText}` }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let suggestions: any[];
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output, try again" }, { status: 502 });
    }

    // Validate and sanitize — never trust model output blindly, especially since it
    // feeds directly into pipeline node creation.
    const safe = (Array.isArray(suggestions) ? suggestions : [])
      .filter((s) => ALLOWED_TYPES.includes(s.type))
      .slice(0, 6)
      .map((s) => ({
        type: s.type,
        reason: typeof s.reason === "string" ? s.reason.slice(0, 200) : "",
        config: typeof s.config === "object" && s.config !== null ? s.config : {},
      }));

    return NextResponse.json({ suggestions: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}