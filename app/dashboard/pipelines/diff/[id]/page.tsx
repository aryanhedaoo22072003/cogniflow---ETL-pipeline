"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

type NodeType = string;

function typeColor(type: NodeType): string {
  if (type === "source") return "#5B9CF6";
  if (type === "target") return "#1FA971";
  if (["router", "union", "joiner", "lookup", "updateStrategy"].includes(type)) return "#D98A1E";
  return "#7C6AE8";
}

const STATUS_COLOR: Record<string, string> = {
  added: "#1FA971",
  removed: "#DA4B4B",
  modified: "#D98A1E",
  unchanged: "#C4CBDC",
};
const STATUS_LABEL: Record<string, string> = {
  added: "Added",
  removed: "Removed",
  modified: "Modified",
  unchanged: "Unchanged",
};

const ROW_H = 78;
const NODE_W = 190;

export default function DiffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(undefined);
  const [error, setError] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pipelines/${id}/diff`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      });
  }, [id]);

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-start gap-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg px-4 py-3 text-[13px] text-[#B91C1C] max-w-lg">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
        <Link href="/dashboard/pipelines" className="text-xs text-[#2F6FED] font-semibold mt-4 inline-block">← Back to pipelines</Link>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-sm text-[#6B7385]">Loading diff…</div>;

  const { source, target, sourceNodes, targetNodes, statusById, changedFieldsById, summary } = data;

  const sourceIdx = new Map(sourceNodes.map((n: any, i: number) => [n.id, i]));
  const targetIdx = new Map(targetNodes.map((n: any, i: number) => [n.id, i]));
  const canvasHeight = Math.max(sourceNodes.length, targetNodes.length) * ROW_H + 40;
  const leftX = 0;
  const rightX = 420;
  const midX = (leftX + NODE_W + rightX) / 2;

  const changedIds = changedFieldsById && hoveredId ? changedFieldsById[hoveredId] : null;

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="text-[12px] text-[#9AA1B2] mb-2">
        Home <span className="mx-1">›</span> <Link href="/dashboard/pipelines" className="hover:underline">Data Integration</Link> <span className="mx-1">›</span>{" "}
        <span className="text-[#6B7385]">Diff</span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{target.name}</h1>
          <div className="flex items-center gap-2 text-[13px] text-[#6B7385]">
            <span className="font-mono bg-[#F4F6FA] px-2 py-0.5 rounded">{source.environment}</span>
            <ArrowRight size={13} />
            <span className="font-mono bg-[#F4F6FA] px-2 py-0.5 rounded">{target.environment}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(["added", "removed", "modified", "unchanged"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5 bg-white border border-[#E3E7EF] rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
              <span className="text-[12px] font-semibold">{summary[s]}</span>
              <span className="text-[11px] text-[#9AA1B2]">{STATUS_LABEL[s]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E3E7EF] rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4 px-1" style={{ minWidth: rightX + NODE_W }}>
          <span className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2]">{source.environment} (source)</span>
          <span className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2]">{target.environment} (this pipeline)</span>
        </div>

        <div className="relative" style={{ height: canvasHeight, minWidth: rightX + NODE_W }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {sourceNodes.map((n: any) => {
              const status = statusById[n.id];
              const si = sourceIdx.get(n.id) as number;
              const y1 = si * ROW_H + 30;
              if (status === "removed") {
                return (
                  <path key={n.id} d={`M${leftX + NODE_W},${y1} L${leftX + NODE_W + 40},${y1}`} stroke={STATUS_COLOR.removed} strokeWidth={2} strokeDasharray="4,3" fill="none" />
                );
              }
              const ti = targetIdx.get(n.id) as number;
              const y2 = ti * ROW_H + 30;
              const mid = midX;
              return (
                <path
                  key={n.id}
                  d={`M${leftX + NODE_W},${y1} C${mid},${y1} ${mid},${y2} ${rightX},${y2}`}
                  stroke={STATUS_COLOR[status]}
                  strokeWidth={hoveredId === n.id ? 3 : 1.6}
                  opacity={hoveredId && hoveredId !== n.id ? 0.15 : 0.8}
                  fill="none"
                />
              );
            })}
            {targetNodes.map((n: any) => {
              const status = statusById[n.id];
              if (status !== "added") return null;
              const ti = targetIdx.get(n.id) as number;
              const y2 = ti * ROW_H + 30;
              return (
                <path key={n.id} d={`M${rightX - 40},${y2} L${rightX},${y2}`} stroke={STATUS_COLOR.added} strokeWidth={2} strokeDasharray="4,3" fill="none" />
              );
            })}
          </svg>

          {sourceNodes.map((n: any, i: number) => (
            <DiffNode
              key={n.id}
              node={n}
              x={leftX}
              y={i * ROW_H}
              status={statusById[n.id]}
              onHover={setHoveredId}
              hovered={hoveredId === n.id}
            />
          ))}
          {targetNodes.map((n: any, i: number) => (
            <DiffNode
              key={n.id}
              node={n}
              x={rightX}
              y={i * ROW_H}
              status={statusById[n.id]}
              onHover={setHoveredId}
              hovered={hoveredId === n.id}
            />
          ))}
        </div>
      </div>

      {hoveredId && changedIds && changedIds.length > 0 && (
        <div className="mt-4 bg-white border border-[#F2D9A8] rounded-xl p-4 max-w-lg">
          <div className="text-[11px] uppercase tracking-wide text-[#D98A1E] font-semibold mb-2">Changed fields</div>
          <div className="space-y-1.5">
            {changedIds.map((f: any, i: number) => (
              <div key={i} className="text-[12px] font-mono flex items-center gap-2">
                <span className="text-[#6B7385]">{f.key}:</span>
                <span className="text-[#DA4B4B] line-through">{JSON.stringify(f.from)}</span>
                <ArrowRight size={10} className="text-[#9AA1B2]" />
                <span className="text-[#1FA971]">{JSON.stringify(f.to)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hoveredId && (
        <p className="text-[12px] text-[#9AA1B2] mt-3">Hover a node to see what changed, and to trace its wire across environments.</p>
      )}
    </div>
  );
}

function DiffNode({
  node,
  x,
  y,
  status,
  onHover,
  hovered,
}: {
  node: { id: string; type: string; label: string };
  x: number;
  y: number;
  status: string;
  onHover: (id: string | null) => void;
  hovered: boolean;
}) {
  const tColor = typeColor(node.type);
  const sColor = STATUS_COLOR[status];
  return (
    <div
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className="absolute bg-white rounded-xl px-3.5 py-2.5 shadow-sm cursor-default transition-all"
style={{
        left: x,
        top: y,
        width: NODE_W,
        borderStyle: "solid",
        borderTopWidth: "3px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderTopColor: tColor,
        borderRightColor: hovered ? sColor : "#E3E7EF",
        borderBottomColor: hovered ? sColor : "#E3E7EF",
        borderLeftColor: hovered ? sColor : "#E3E7EF",
        boxShadow: hovered ? `0 0 0 3px ${sColor}22` : undefined,
        opacity: status === "removed" || status === "added" ? 1 : hovered ? 1 : 0.95,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">{node.label}</span>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sColor }} title={STATUS_LABEL[status]} />
      </div>
      <div className="text-[9.5px] font-mono text-[#9AA1B2] mt-0.5 uppercase tracking-wide">{node.type}</div>
    </div>
  );
}