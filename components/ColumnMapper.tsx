"use client";
import { useState } from "react";
import { ArrowRight, Shuffle, X, Check } from "lucide-react";

interface Mapping { from: string; to: string; transform?: string; }

interface Props {
  sourceHeaders: string[];
  targetHeaders: string[];
  mappings: Mapping[];
  onChange: (mappings: Mapping[]) => void;
}

const TRANSFORMS = [
  { value: "", label: "No transform" },
  { value: "uppercase", label: "UPPERCASE" },
  { value: "lowercase", label: "lowercase" },
  { value: "trim", label: "Trim whitespace" },
  { value: "toNumber", label: "To number" },
  { value: "toString", label: "To string" },
  { value: "toDate", label: "To date" },
];

export default function ColumnMapper({ sourceHeaders, targetHeaders, mappings, onChange }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  const mappedSources = mappings.map(m => m.from);
  const mappedTargets = mappings.map(m => m.to);

  function autoMap() {
    const newMappings: Mapping[] = sourceHeaders.map(src => ({
      from: src,
      to: targetHeaders.find(t => t.toLowerCase() === src.toLowerCase()) || src,
      transform: "",
    }));
    onChange(newMappings);
  }

  function clearAll() { onChange([]); }

  function removeMapping(from: string) {
    onChange(mappings.filter(m => m.from !== from));
  }

  function updateTransform(from: string, transform: string) {
    onChange(mappings.map(m => m.from === from ? { ...m, transform } : m));
  }

  function onDrop(targetCol: string) {
    if (!dragging) return;
    const filtered = mappings.filter(m => m.from !== dragging && m.to !== targetCol);
    onChange([...filtered, { from: dragging, to: targetCol, transform: "" }]);
    setDragging(null);
    setHoveredTarget(null);
  }

  return (
    <div className="border border-[#E3E7EF] rounded-xl overflow-hidden mt-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F2F6] bg-[#FAFBFD]">
        <div>
          <span className="text-[12.5px] font-semibold">Column mapping</span>
          <span className="ml-2 text-[10.5px] text-[#9AA1B2]">
            {mappings.length}/{sourceHeaders.length} mapped
          </span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={autoMap}
            className="flex items-center gap-1 text-[11px] font-semibold border border-[#2F6FED] text-[#2F6FED] rounded-lg px-2 py-1 hover:bg-[#2F6FED10]">
            <Shuffle size={10}/> Auto-map
          </button>
          {mappings.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-semibold border border-[#E3E7EF] text-[#9AA1B2] rounded-lg px-2 py-1 hover:border-red-300 hover:text-red-500">
              <X size={10}/> Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-3 max-h-[400px] overflow-y-auto">
        {/* Mapping rows */}
        <div className="space-y-1.5">
          {sourceHeaders.map(src => {
            const mapping = mappings.find(m => m.from === src);
            const isDragging = dragging === src;

            return (
              <div key={src} className="flex items-center gap-2">
                {/* Source */}
                <div
                  draggable
                  onDragStart={() => setDragging(src)}
                  onDragEnd={() => { setDragging(null); setHoveredTarget(null); }}
                  className={`flex-1 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border cursor-grab transition-all truncate ${
                    isDragging ? "border-[#2F6FED] bg-[#2F6FED10] opacity-60" :
                    mapping ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                    "border-[#E3E7EF] bg-[#FAFBFD] text-[#1A2233] hover:border-[#2F6FED]"
                  }`}
                  title={src}
                >
                  {src}
                </div>

                {/* Arrow */}
                <ArrowRight size={12} className={mapping ? "text-emerald-400 flex-shrink-0" : "text-[#D1D5E0] flex-shrink-0"} />

                {/* Target drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setHoveredTarget(src); }}
                  onDragLeave={() => setHoveredTarget(null)}
                  onDrop={() => {
                    if (!dragging) return;
                    const filtered = mappings.filter(m => m.from !== dragging && m.to !== src);
                    onChange([...filtered, { from: dragging, to: src, transform: "" }]);
                    setDragging(null); setHoveredTarget(null);
                  }}
                  className={`flex-1 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border truncate transition-all ${
                    hoveredTarget === src ? "border-[#2F6FED] bg-[#2F6FED08] scale-[1.02]" :
                    mapping ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                    "border-dashed border-[#D1D5E0] bg-white text-[#C5CADE]"
                  }`}
                  title={mapping?.to || "Drop here"}
                >
                  {mapping?.to || "drop here"}
                </div>

                {/* Remove / check */}
                {mapping ? (
                  <button onClick={() => removeMapping(src)}
                    className="text-[#9AA1B2] hover:text-red-500 flex-shrink-0">
                    <X size={12} />
                  </button>
                ) : (
                  <div className="w-4 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Transforms section */}
        {mappings.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#F4F6FA]">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#9AA1B2] mb-2">
              Transforms (optional)
            </div>
            <div className="space-y-1.5">
              {mappings.filter(m => m.from !== m.to || m.transform).map(m => (
                <div key={m.from} className="flex items-center gap-2">
                  <span className="text-[10.5px] font-mono text-[#2F6FED] w-24 truncate flex-shrink-0">{m.from}</span>
                  <ArrowRight size={10} className="text-[#C5CADE] flex-shrink-0" />
                  <span className="text-[10.5px] font-mono text-emerald-600 w-24 truncate flex-shrink-0">{m.to}</span>
                  <select
                    className="flex-1 border border-[#E3E7EF] rounded px-1.5 py-1 text-[10.5px] focus:outline-none focus:border-[#2F6FED]"
                    value={m.transform || ""}
                    onChange={e => updateTransform(m.from, e.target.value)}
                  >
                    {TRANSFORMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty hint */}
        {mappings.length === 0 && (
          <div className="text-center py-4 text-[11px] text-[#9AA1B2]">
            Drag source → target to map, or click <strong>Auto-map</strong>
          </div>
        )}
      </div>
    </div>
  );
}