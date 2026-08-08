"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { TRANSFORM_LABELS, TransformType } from "@/lib/transforms";

interface Suggestion {
  type: TransformType;
  reason: string;
  config: Record<string, any>;
}

export default function AiSuggestModal({
  rows,
  headers,
  onAddNodes,
  onClose,
}: {
  rows: Record<string, any>[];
  headers: string[];
  onAddNodes: (suggestions: Suggestion[]) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/ai/suggest-transforms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: rows.slice(0, 500), headers }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
        } else {
          setSuggestions(data.suggestions || []);
          setSelected(new Set((data.suggestions || []).map((_: any, i: number) => i)));
        }
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    run();
  }, []);

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function addSelected() {
    const chosen = suggestions.filter((_, i) => selected.has(i));
    onAddNodes(chosen);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[520px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E3E7EF]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#7C6AE8]" />
            <h3 className="text-[16px] font-semibold">Suggested transforms</h3>
          </div>
          <button onClick={onClose}><X size={18} className="text-[#9AA1B2]" /></button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#6B7385] text-sm gap-2">
              <Loader2 size={20} className="animate-spin text-[#7C6AE8]" />
              Analyzing your columns…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg px-4 py-3 text-[12.5px] text-[#B91C1C]">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {!loading && !error && suggestions.length === 0 && (
            <div className="text-sm text-[#9AA1B2] text-center py-10">
              No suggestions — your data looks clean, or there wasn't enough signal to suggest anything specific.
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="space-y-2.5">
              {suggestions.map((s, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3 border rounded-xl p-3.5 cursor-pointer transition-colors ${
                    selected.has(i) ? "border-[#7C6AE8] bg-[#7C6AE808]" : "border-[#E3E7EF]"
                  }`}
                >
                  <input type="checkbox" className="mt-1" checked={selected.has(i)} onChange={() => toggle(i)} />
                  <div>
                    <div className="text-[13px] font-semibold flex items-center gap-2">
                      <span className="text-[10.5px] font-mono uppercase tracking-wide bg-[#7C6AE814] text-[#7C6AE8] px-2 py-0.5 rounded-full">
                        {TRANSFORM_LABELS[s.type]}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#6B7385] mt-1.5 leading-relaxed">{s.reason}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && suggestions.length > 0 && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E3E7EF]">
            <button onClick={onClose} className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-3.5 py-2">Cancel</button>
            <button
              onClick={addSelected}
              disabled={selected.size === 0}
              className="text-xs font-semibold bg-[#7C6AE8] text-white rounded-lg px-3.5 py-2 disabled:opacity-50"
            >
              Add {selected.size} step{selected.size !== 1 ? "s" : ""} to canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
