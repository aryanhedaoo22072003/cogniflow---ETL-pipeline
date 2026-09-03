"use client";
import { useState } from "react";
import { Sparkles, X, Check, ChevronRight, Loader2 } from "lucide-react";

interface CleaningStep {
  type: string;
  label: string;
  description: string;
  config: Record<string, any>;
  impact: string;
  severity: "high" | "medium" | "low";
}

interface Props {
  rows: any[];
  headers: string[];
  onApply: (steps: { type: string; config: Record<string, any> }[]) => void;
  onClose: () => void;
}

export default function AiCleaningModal({ rows, headers, onApply, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CleaningStep[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [analysed, setAnalysed] = useState(false);
  const [applying, setApplying] = useState(false);

  async function analyse() {
    setLoading(true);
    try {
      // Sample first 50 rows for analysis
      const sample = rows.slice(0, 50);

      // Profile each column
      const profile = headers.map(h => {
        const values = sample.map(r => r[h]);
        const nulls = values.filter(v => v === null || v === undefined || v === "").length;
        const unique = new Set(values.filter(Boolean)).size;
        const nums = values.filter(v => v !== "" && !isNaN(Number(v)));
        const isNumeric = nums.length > values.length * 0.8;
        const sample5 = values.filter(Boolean).slice(0, 5);
        return { column: h, nulls, nullPct: Math.round(nulls / values.length * 100), unique, isNumeric, sample: sample5 };
      });

      const res = await fetch("/api/ai/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, rowCount: rows.length, headers }),
      });
      const data = await res.json();
      const steps: CleaningStep[] = data.steps || [];
      setSuggestions(steps);
      setSelected(new Set(steps.map((_, i) => i)));
      setAnalysed(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function toggleStep(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function applySelected() {
    setApplying(true);
    const toApply = suggestions
      .filter((_, i) => selected.has(i))
      .map(s => ({ type: s.type, config: s.config }));
    onApply(toApply);
    setApplying(false);
    onClose();
  }

  const severityColor = (s: string) =>
    s === "high" ? "text-red-600 bg-red-50 border-red-200" :
    s === "medium" ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-blue-600 bg-blue-50 border-blue-200";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C6AE8] to-[#2F6FED] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-[15px]">AI Data Cleaning</div>
              <div className="text-[11.5px] text-[#9AA1B2]">
                {rows.length.toLocaleString()} rows · {headers.length} columns analysed
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9AA1B2] hover:text-[#1A2233]"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!analysed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C6AE8] to-[#2F6FED] flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-white" />
              </div>
              <h3 className="text-[16px] font-semibold mb-2">Analyse your data</h3>
              <p className="text-[13px] text-[#6B7385] max-w-sm mx-auto mb-6 leading-relaxed">
                AI will scan your CSV for nulls, duplicates, inconsistent formats, outliers,
                and suggest cleaning steps to fix them.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8 text-left">
                {[
                  { icon: "🔍", title: "Null detection", desc: "Find and handle missing values" },
                  { icon: "🔄", title: "Deduplication", desc: "Remove duplicate rows" },
                  { icon: "📐", title: "Format fixes", desc: "Standardise dates, numbers, case" },
                ].map(item => (
                  <div key={item.title} className="border border-[#E3E7EF] rounded-xl p-3">
                    <div className="text-xl mb-1.5">{item.icon}</div>
                    <div className="text-[12px] font-semibold">{item.title}</div>
                    <div className="text-[11px] text-[#9AA1B2]">{item.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={analyse} disabled={loading}
                className="bg-gradient-to-r from-[#7C6AE8] to-[#2F6FED] text-white font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 mx-auto">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Analysing…</> : <><Sparkles size={15} /> Analyse data</>}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[14px]">
                    {suggestions.length} cleaning steps suggested
                  </h3>
                  <p className="text-[11.5px] text-[#9AA1B2]">
                    {selected.size} selected · click to toggle
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(suggestions.map((_, i) => i)))}
                    className="text-[11px] font-semibold text-[#2F6FED] hover:underline">Select all</button>
                  <button onClick={() => setSelected(new Set())}
                    className="text-[11px] font-semibold text-[#9AA1B2] hover:underline">Clear</button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto mb-5">
                {suggestions.map((step, i) => (
                  <div
                    key={i}
                    onClick={() => toggleStep(i)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selected.has(i)
                        ? "border-[#2F6FED] bg-[#2F6FED06]"
                        : "border-[#E3E7EF] bg-white hover:border-[#C5CADE]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selected.has(i) ? "bg-[#2F6FED]" : "border-2 border-[#D1D5E0]"
                    }`}>
                      {selected.has(i) && <Check size={11} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold">{step.label}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${severityColor(step.severity)}`}>
                          {step.severity}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-[#6B7385]">{step.description}</div>
                      <div className="text-[11px] text-[#9AA1B2] mt-1 font-mono">{step.impact}</div>
                    </div>
                    <ChevronRight size={14} className="text-[#C5CADE] flex-shrink-0 mt-1" />
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <div className="text-center py-8 text-[13px] text-[#9AA1B2]">
                    ✓ No cleaning issues found — your data looks clean!
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {analysed && suggestions.length > 0 && (
          <div className="px-6 pb-6 flex gap-2 border-t border-[#F0F2F6] pt-4">
            <button onClick={onClose} className="flex-1 border border-[#E3E7EF] text-sm font-semibold py-2.5 rounded-xl hover:border-[#2F6FED]">
              Cancel
            </button>
            <button onClick={applySelected} disabled={selected.size === 0 || applying}
              className="flex-1 bg-gradient-to-r from-[#7C6AE8] to-[#2F6FED] text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
              {applying ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Apply {selected.size} step{selected.size !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}