import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "filter", "rename", "dedupe", "nulls", "expression", "sequence",
  "sorter", "rank", "aggregator", "normalizer", "target",
];

const SYSTEM_PROMPT = `You are CogniFlow's pipeline copilot — a conversational assistant that can modify an
EXISTING data pipeline, not just generate one from scratch. You'll be given the current pipeline as an
ordered list of steps (id, type, config), the real column names available, and a conversation history.
The user will describe a change in plain English. Figure out the minimal set of operations that
accomplishes it.

Respond with ONLY a JSON object, no prose, no markdown fences, in this exact shape:
{
  "reply": "a short, friendly sentence describing what you changed (or, if you didn't change anything, why)",
  "operations": [ ...zero or more operation objects... ]
}

Each operation is one of:
- {"op":"add","type":"<transform type>","config":{...},"reason":"why this step"}
- {"op":"remove","nodeId":"<id from the pipeline you were given>","reason":"why"}
- {"op":"update","nodeId":"<id from the pipeline you were given>","config":{...partial fields to merge...},"reason":"why"}

Allowed transform types for "add": ["filter","rename","dedupe","nulls","expression","sequence","sorter","rank","aggregator","normalizer","target"].
You may NOT add a "source" node, and you may NOT add router/union/joiner/lookup/updateStrategy — those
need a second uploaded reference file the user hasn't given you in this chat. If asked for one of those,
say so plainly in "reply" and return an empty operations array.

Config fields per type (only include fields relevant to what changed for "update"; include all for "add"):
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
- target: { "table"?: string }

Rules:
- "nodeId" in remove/update MUST be one of the ids from the pipeline you were given — never invent one.
- Use the EXACT column names given — never guess, pluralize, or invent a column.
- If the user asks something that needs a column that doesn't exist, say so in "reply" and skip that part.
- If the user is just asking a question ("what does this pipeline do?"), answer in "reply" and return operations: [].
- Keep "reply" to 1-2 sentences, conversational, like a helpful coworker — not a changelog.`;

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
    const messages: { role: "user" | "assistant"; content: string }[] = body.messages || [];
    const nodes: any[] = body.nodes || [];
    const headers: string[] = body.headers || [];

    if (messages.length === 0) return NextResponse.json({ error: "No message provided" }, { status: 400 });
    if (headers.length === 0) return NextResponse.json({ error: "No source columns available yet" }, { status: 400 });

    const pipelineSummary = nodes.map((n) => ({ id: n.id, type: n.type, config: n.config }));
    const contextMessage = {
      role: "user" as const,
      content: `Current pipeline (in order):\n${JSON.stringify(pipelineSummary, null, 2)}\n\nAvailable columns: ${JSON.stringify(headers)}`,
    };

    const recentHistory = messages.slice(-10);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, contextMessage, ...recentHistory],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Groq API error: ${errText}` }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{"reply":"","operations":[]}';
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output, try rephrasing" }, { status: 502 });
    }

    const existingIds = new Set(nodes.map((n) => n.id));
    const headerSet = new Set(headers);
    const safeOps = (Array.isArray(parsed.operations) ? parsed.operations : [])
      .filter((o: any) => ["add", "remove", "update"].includes(o?.op))
      .filter((o: any) => {
        if (o.op === "add") return ALLOWED_TYPES.includes(o.type);
        return existingIds.has(o.nodeId);
      })
      .slice(0, 8)
      .map((o: any) => {
        const config = typeof o.config === "object" && o.config !== null ? { ...o.config } : {};
        ["column", "from", "groupBy", "targetColumn"].forEach((key) => {
          if (config[key] && !headerSet.has(config[key])) delete config[key];
        });
        return {
          op: o.op,
          type: o.op === "add" ? o.type : undefined,
          nodeId: o.op !== "add" ? o.nodeId : undefined,
          config,
          reason: typeof o.reason === "string" ? o.reason.slice(0, 200) : "",
        };
      });

    return NextResponse.json({
      reply: typeof parsed.reply === "string" ? parsed.reply.slice(0, 500) : "Done.",
      operations: safeOps,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}