"use client";

import { X, Hash, Type, Calendar, ToggleLeft, CircleSlash } from "lucide-react";
import { profileColumns, ColumnType } from "@/lib/dataProfile";

const TYPE_ICON: Record<ColumnType, any> = {
  number: Hash,
  string: Type,
  date: Calendar,
  boolean: ToggleLeft,
  empty: CircleSlash,
};
const TYPE_COLOR: Record<ColumnType, string> = {
  number: "#2F6FED",
  string: "#7C6AE8",
  date: "#1FA971",
  boolean: "#D98A1E",
  empty: "#9AA1B2",
};

export default function DataProfileModal({
  rows,
  headers,
  isSample,
  onClose,
}: {
  rows: Record<string, any>[];
  headers: string[];
  isSample?: boolean;
  onClose: () => void;
}) {
  const profiles = profileColumns(rows, headers);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[720px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E3E7EF]">
          <div>
            <h3 className="text-[16px] font-semibold">Data profile</h3>
            <p className="text-xs text-[#6B7385] mt-0.5">
              {rows.length} row{rows.length !== 1 ? "s" : ""} · {headers.length} columns
              {isSample && <span className="text-[#D98A1E]"> — based on a small sample, not the full source</span>}
            </p>
          </div>
          <button onClick={onClose}><X size={18} className="text-[#9AA1B2]" /></button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2.5">
          {profiles.map((p) => {
            const Icon = TYPE_ICON[p.type];
            const color = TYPE_COLOR[p.type];
            return (
              <div key={p.name} className="border border-[#E3E7EF] rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: color + "18", color }}>
                      <Icon size={13} />
                    </div>
                    <span className="text-[13.5px] font-semibold">{p.name}</span>
                    <span className="text-[10.5px] font-mono uppercase tracking-wide text-[#9AA1B2]">{p.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px]">
                    <span className={p.nullPct > 30 ? "text-[#D98A1E] font-semibold" : "text-[#9AA1B2]"}>
                      {p.nullPct}% null
                    </span>
                    <span className="text-[#9AA1B2]">{p.distinctCount} distinct</span>
                  </div>
                </div>
                {p.nullPct > 30 && (
                  <div className="text-[11px] text-[#D98A1E] bg-[#D98A1E10] rounded px-2 py-1 mb-2">
                    Over 30% empty — worth a Handle Nulls step before relying on this column.
                  </div>
                )}
                {(p.type === "number" || p.type === "date") && p.min !== undefined && (
                  <div className="text-[12px] font-mono text-[#6B7385]">
                    min: {p.min} · max: {p.max}{p.avg !== undefined && ` · avg: ${p.avg}`}
                  </div>
                )}
                {p.topValues && p.topValues.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.topValues.map((tv) => (
                      <span key={tv.value} className="text-[11px] bg-[#F4F6FA] text-[#6B7385] px-2 py-0.5 rounded-full">
                        {tv.value} <span className="text-[#9AA1B2]">×{tv.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}