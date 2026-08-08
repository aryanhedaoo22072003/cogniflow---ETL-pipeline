"use client";

import { useState } from "react";
import { X, Wand2, Loader2, AlertTriangle } from "lucide-react";
import { TRANSFORM_LABELS, TransformType } from "@/lib/transforms";

interface Step {
  type: TransformType;
  reason: string;
  config: Record<string, any>;
}

export default function AiGeneratePipelineModal({
  rows,
  headers,
  hasExistingSteps,
  onApply,
  onClose,
}: {
  rows: Record<string, any>[];
  headers: string[];
  hasExistingSteps: boolean;
  onApply: (steps: Step[]) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setSteps(null);
    try {
      const res = await fetch("/api/ai/generate-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, headers, rows: rows.slice(0, 500) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSteps(data.steps || []);
        setSelected(new Set((data.steps || []).map((_: any, i: number) => i)));
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function apply() {
    if (!steps) return;
    const chosen = steps.filter((_, i) => selected.has(i));
    onApply(chosen);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[560px] max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E3E7EF]">
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-[#7C6AE8]" />
            <h3 className="text-[16px] font-semibold">Build pipeline from a prompt</h3>
          </div>
          <button onClick={onClose}><X size={18} className="text-[#9AA1B2]" /></button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <label className="block text-[11px] font-mono text-[#6B7385] mb-1.5">
            Describe what you want the pipeline to do
          </label>
          <textarea
            className="w-full border border-[#E3E7EF] rounded-lg px-3 py-2.5 text-sm resize-none"
            rows={3}
            placeholder="e.g. Remove duplicate rows by email, drop rows with no phone number, then sort by signup date descending"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="text-[11px] text-[#9AA1B2] mt-1.5">
            Using columns from your source: {headers.slice(0, 6).join(", ")}{headers.length > 6 ? `, +${headers.length - 6} more` : ""}
          </div>

          {hasExistingSteps && !steps && (
            <div className="flex items-start gap-2.5 bg-[#FFF7E8] border border-[#F2D9A8] rounded-lg px-3.5 py-2.5 mt-3 text-[12px] text-[#7A5B12]">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              This will replace your current transform steps (everything after the Source node) with the generated ones.
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full mt-3 text-xs font-semibold bg-[#7C6AE8] text-white rounded-lg py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : "Generate pipeline"}
          </button>

          {error && (
            <div className="flex items-start gap-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg px-4 py-3 mt-3 text-[12.5px] text-[#B91C1C]">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {steps && steps.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-[#9AA1B2] mb-2">
                Generated steps — uncheck any you don't want
              </div>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors ${
                      selected.has(i) ? "border-[#7C6AE8] bg-[#7C6AE808]" : "border-[#E3E7EF]"
                    }`}
                  >
                    <input type="checkbox" className="mt-1" checked={selected.has(i)} onChange={() => toggle(i)} />
                    <div>
                      <span className="text-[10.5px] font-mono uppercase tracking-wide bg-[#7C6AE814] text-[#7C6AE8] px-2 py-0.5 rounded-full">
                        {i + 1}. {TRANSFORM_LABELS[s.type]}
                      </span>
                      <p className="text-[12.5px] text-[#6B7385] mt-1.5 leading-relaxed">{s.reason}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {steps && steps.length > 0 && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E3E7EF]">
            <button onClick={onClose} className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-3.5 py-2">Cancel</button>
            <button
              onClick={apply}
              disabled={selected.size === 0}
              className="text-xs font-semibold bg-[#7C6AE8] text-white rounded-lg px-3.5 py-2 disabled:opacity-50"
            >
              Apply {selected.size} step{selected.size !== 1 ? "s" : ""} to canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}