"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Loader2, Plus, Minus, PencilLine, Check } from "lucide-react";
import { TRANSFORM_LABELS, TransformType } from "@/lib/transforms";

export interface CopilotOperation {
  op: "add" | "remove" | "update";
  type?: TransformType;
  nodeId?: string;
  config: Record<string, any>;
  reason: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  operations?: CopilotOperation[];
  applied?: boolean;
}

export default function CopilotChat({
  nodes,
  headers,
  onApplyOperations,
  onClose,
}: {
  nodes: { id: string; type: string; config: Record<string, any> }[];
  headers: string[];
  onApplyOperations: (ops: CopilotOperation[]) => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey — I can see your current pipeline. Ask me to add, remove, or change a step, or just ask what something does.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          nodes,
          headers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, operations: data.operations?.length ? data.operations : undefined },
        ]);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  function applyMessageOps(idx: number) {
    const msg = messages[idx];
    if (!msg.operations) return;
    onApplyOperations(msg.operations);
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, applied: true } : m)));
  }

  function discardMessageOps(idx: number) {
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, operations: undefined } : m)));
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-[#E3E7EF] flex flex-col z-40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E7EF] bg-gradient-to-r from-[#7C6AE8] to-[#5B9CF6]">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={15} />
          <span className="text-[13.5px] font-semibold">Pipeline Copilot</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
              <div
                className={`text-[13px] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#2F6FED] text-white rounded-br-sm"
                    : "bg-[#F4F6FA] text-[#1A2233] rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>

              {m.operations && (
                <div className="mt-2 border border-[#E3E7EF] rounded-xl overflow-hidden">
                  <div className="divide-y divide-[#F0F2F6]">
                    {m.operations.map((op, oi) => (
                      <div key={oi} className="flex items-start gap-2 px-3 py-2">
                        <OpIcon op={op.op} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11.5px] font-semibold text-[#1A2233]">
                            {op.op === "add" && `Add ${TRANSFORM_LABELS[op.type as TransformType]}`}
                            {op.op === "remove" && `Remove step`}
                            {op.op === "update" && `Update step`}
                          </div>
                          <div className="text-[11px] text-[#6B7385]">{op.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!m.applied ? (
                    <div className="flex gap-2 px-3 py-2 bg-[#FAFBFD] border-t border-[#F0F2F6]">
                      <button
                        onClick={() => applyMessageOps(i)}
                        className="flex-1 text-[11.5px] font-semibold bg-[#7C6AE8] text-white rounded-lg py-1.5 hover:opacity-90"
                      >
                        Apply changes
                      </button>
                      <button
                        onClick={() => discardMessageOps(i)}
                        className="text-[11.5px] font-semibold border border-[#E3E7EF] rounded-lg px-3 py-1.5 text-[#6B7385]"
                      >
                        Discard
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 text-[11.5px] font-semibold">
                      <Check size={12} /> Applied to canvas
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F4F6FA] rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 text-[#6B7385] text-[13px]">
              <Loader2 size={13} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}

        {error && (
          <div className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}
      </div>

      <div className="p-3 border-t border-[#E3E7EF] flex gap-2">
        <input
          className="flex-1 border border-[#E3E7EF] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#7C6AE8]"
          placeholder="e.g. also dedupe by phone number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="w-9 h-9 flex items-center justify-center bg-[#7C6AE8] text-white rounded-lg disabled:opacity-40 flex-shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function OpIcon({ op }: { op: string }) {
  const cfg =
    op === "add"
      ? { Icon: Plus, color: "#1FA971", bg: "#1FA97118" }
      : op === "remove"
      ? { Icon: Minus, color: "#DA4B4B", bg: "#DA4B4B18" }
      : { Icon: PencilLine, color: "#D98A1E", bg: "#D98A1E18" };
  const { Icon, color, bg } = cfg;
  return (
    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: bg, color }}>
      <Icon size={11} />
    </div>
  );
}