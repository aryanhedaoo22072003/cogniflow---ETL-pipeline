"use client";
import { useEffect, useState } from "react";
import { History, RotateCcw, Tag, X, ChevronRight } from "lucide-react";

interface Version {
  _id: string;
  version: number;
  name: string;
  environment: string;
  nodes: any[];
  label: string;
  savedAt: string;
}

interface Props {
  pipelineId: string;
  currentNodes: any[];
  onRestore: (nodes: any[], edges: any[], headers: string[]) => void;
  onClose: () => void;
}

export default function VersionHistoryPanel({ pipelineId, currentNodes, onRestore, onClose }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [labeling, setLabeling] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");
  const [savingLabel, setSavingLabel] = useState(false);

  useEffect(() => {
    if (!pipelineId || pipelineId === "new") return;
    fetch(`/api/pipelines/${pipelineId}/versions`)
      .then(r => r.json())
      .then(d => { setVersions(d.versions || []); setLoading(false); });
  }, [pipelineId]);

  async function restore(v: Version) {
    if (!confirm(`Restore to version ${v.version}? Current state will be auto-saved first.`)) return;
    setRestoring(v._id);
    const res = await fetch(`/api/pipelines/${pipelineId}/versions/${v._id}/restore`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      // Fetch the full version with rows
      const fullRes = await fetch(`/api/pipelines/${pipelineId}`);
      const fullData = await fullRes.json();
      onRestore(fullData.pipeline.nodes, fullData.pipeline.edges || [], fullData.pipeline.headers || []);
      // Refresh versions list
      fetch(`/api/pipelines/${pipelineId}/versions`)
        .then(r => r.json())
        .then(d => setVersions(d.versions || []));
    }
    setRestoring(null);
  }

  async function saveLabel(versionId: string) {
    setSavingLabel(true);
    await fetch(`/api/pipelines/${pipelineId}/versions/${versionId}/label`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: labelText }),
    });
    setVersions(prev => prev.map(v => v._id === versionId ? { ...v, label: labelText } : v));
    setLabeling(null);
    setLabelText("");
    setSavingLabel(false);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-[#E3E7EF] shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E7EF] flex-shrink-0">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#7C6AE8]" />
          <span className="text-[14px] font-semibold">Version history</span>
        </div>
        <button onClick={onClose} className="text-[#9AA1B2] hover:text-[#1A2233]">
          <X size={18} />
        </button>
      </div>

      {/* Current state indicator */}
      <div className="px-4 py-3 bg-[#2F6FED08] border-b border-[#E3E7EF] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2F6FED] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#2F6FED]">Current (unsaved changes)</span>
        </div>
        <div className="text-[11px] text-[#9AA1B2] mt-1">{currentNodes.length} nodes</div>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-[#F0F2F6] rounded w-24 mb-2" />
                <div className="h-3 bg-[#F0F2F6] rounded w-40" />
              </div>
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center">
            <History size={28} className="text-[#E3E7EF] mx-auto mb-3" />
            <p className="text-sm text-[#9AA1B2]">No versions yet.</p>
            <p className="text-[11px] text-[#C5CADE] mt-1">Save the pipeline to create the first snapshot.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F4F6FA]">
            {versions.map(v => (
              <div key={v._id} className="px-4 py-3 hover:bg-[#FAFBFD] group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-[#2F6FED] bg-[#2F6FED10] px-1.5 py-0.5 rounded">
                        v{v.version}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold
                        ${v.environment === "PROD" ? "bg-emerald-50 text-emerald-600" :
                          v.environment === "SIT" ? "bg-amber-50 text-amber-600" :
                          "bg-[#2F6FED14] text-[#2F6FED]"}`}>
                        {v.environment}
                      </span>
                    </div>
                    {labeling === v._id ? (
                      <div className="flex gap-1 mt-1">
                        <input
                          autoFocus
                          className="flex-1 text-xs border border-[#E3E7EF] rounded px-2 py-1 focus:outline-none focus:border-[#2F6FED]"
                          placeholder="e.g. Before SCD refactor"
                          value={labelText}
                          onChange={e => setLabelText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveLabel(v._id); if (e.key === "Escape") setLabeling(null); }}
                        />
                        <button onClick={() => saveLabel(v._id)} disabled={savingLabel}
                          className="text-[11px] font-semibold text-white bg-[#2F6FED] rounded px-2 py-1 disabled:opacity-50">
                          {savingLabel ? "…" : "Save"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] text-[#6B7385] truncate">
                          {v.label || `${v.nodes?.length || 0} nodes`}
                        </span>
                        <button onClick={() => { setLabeling(v._id); setLabelText(v.label || ""); }}
                          className="opacity-0 group-hover:opacity-100 text-[#C5CADE] hover:text-[#2F6FED] transition-opacity">
                          <Tag size={10} />
                        </button>
                      </div>
                    )}
                    <div className="text-[11px] text-[#9AA1B2] mt-0.5">
                      {timeAgo(v.savedAt)} · {new Date(v.savedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <button
                    onClick={() => restore(v)}
                    disabled={restoring === v._id}
                    title="Restore this version"
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold text-[#7C6AE8] border border-[#7C6AE8] rounded px-2 py-1 hover:bg-[#7C6AE810] disabled:opacity-40 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <RotateCcw size={10} />
                    {restoring === v._id ? "…" : "Restore"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t border-[#E3E7EF] flex-shrink-0">
        <p className="text-[11px] text-[#9AA1B2] leading-relaxed">
          Versions are created automatically on every save. Max 50 versions kept per pipeline.
        </p>
      </div>
    </div>
  );
}