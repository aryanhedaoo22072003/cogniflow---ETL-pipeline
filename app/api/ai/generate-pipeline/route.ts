import { NextRequest, NextResponse } from "next/server";
import { profileColumns } from "@/lib/dataProfile";

const ALLOWED_TYPES = [
  "filter", "rename", "dedupe", "nulls", "expression", "sequence",
  "sorter", "rank", "aggregator", "normalizer", "target",
];

const SYSTEM_PROMPT = `You are a data engineering assistant embedded in an ETL tool called CogniFlow.
The user will describe, in plain English, what they want a data pipeline to do. You will also be given
the actual column names (and optionally a data profile) of their source dataset.

Turn their description into an ORDERED array of pipeline steps that actually accomplish what they asked,
using only the real column names provided — never invent a column name that isn't in the list.

Respond with ONLY a JSON array, no prose, no markdown fences. Each item must have this exact shape:
{
  "type": one of ["filter","rename","dedupe","nulls","expression","sequence","sorter","rank","aggregator","normalizer","target"],
  "reason": a short one-sentence explanation of what this step does and why it's in this position,
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
- target: always { } — the user hasn't configured a destination connection yet, so a target step is just
  "preview output" for now, regardless of what the user asked for as a final destination.

Rules:
- Always end the array with exactly one "target" step, as the final element.
- Use the EXACT column names given — do not guess, pluralize, or rename columns that weren't asked to be renamed.
- If the request mentions a column that doesn't exist in the provided list, skip that part rather than inventing a column.
- Keep it to what was actually asked — don't add unrequested cleanup steps (that's a different feature, this one should do exactly what the user described).
- Order matters: steps should be in the logical sequence they'd need to run in.`;

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
    const prompt: string = (body.prompt || "").trim();
    const headers: string[] = body.headers || [];
    const rows: Record<string, any>[] = body.rows || [];

    if (!prompt) return NextResponse.json({ error: "Describe what you want the pipeline to do" }, { status: 400 });
    if (headers.length === 0) return NextResponse.json({ error: "No source columns available yet" }, { status: 400 });

    let contextBlock = `Available columns: ${JSON.stringify(headers)}`;
    if (rows.length > 0) {
      const profiles = profileColumns(rows, headers).map((p) => ({
        column: p.name,
        type: p.type,
        nullPct: p.nullPct,
        distinctCount: p.distinctCount,
      }));
      contextBlock += `\n\nColumn profile:\n${JSON.stringify(profiles, null, 2)}`;
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${contextBlock}\n\nUser's request: "${prompt}"` },
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

    let steps: any[];
    try {
      steps = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output, try rephrasing your request" }, { status: 502 });
    }

    // Never trust model output blindly — this feeds directly into node creation.
    const headerSet = new Set(headers);
    const safe = (Array.isArray(steps) ? steps : [])
      .filter((s) => ALLOWED_TYPES.includes(s?.type))
      .slice(0, 10)
      .map((s) => {
        const config = typeof s.config === "object" && s.config !== null ? { ...s.config } : {};
        // Strip any column reference the model hallucinated that isn't real.
        ["column", "from", "groupBy", "targetColumn"].forEach((key) => {
          if (config[key] && !headerSet.has(config[key])) delete config[key];
        });
        return {
          type: s.type,
          reason: typeof s.reason === "string" ? s.reason.slice(0, 200) : "",
          config,
        };
      });

    // Guarantee the chain ends with a target step even if the model forgot.
    if (safe.length === 0 || safe[safe.length - 1].type !== "target") {
      safe.push({ type: "target", reason: "Final output", config: {} });
    }

    return NextResponse.json({ steps: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}