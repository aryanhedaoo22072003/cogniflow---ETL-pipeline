"use client";

import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { Undo2, Redo2 } from "lucide-react";
import type { PipelineNode, TransformType, RunLogStep } from "@/lib/transforms";
import { TRANSFORM_LABELS } from "@/lib/transforms";
import DataProfileModal from "@/components/DataProfileModal";
import AiSuggestModal from "@/components/AiSuggestModal";
import AiGeneratePipelineModal from "@/components/AiGeneratePipelineModal";
import CopilotChat, { CopilotOperation } from "@/components/CopilotChat";

type Row = Record<string, any>;

const TRANSFORM_GROUPS: { title: string; types: TransformType[] }[] = [
  { title: "Source", types: ["source"] },
  { title: "Row & Column Ops", types: ["filter", "rename", "dedupe", "nulls", "expression"] },
   { title: "Generate", types: ["sequence"] },
  { title: "Sort & Aggregate", types: ["sorter", "rank", "aggregator"] },
  { title: "Multi-source", types: ["router", "union", "joiner", "lookup", "updateStrategy"] },
  { title: "Restructure", types: ["normalizer"] },
  { title: "Target", types: ["target"] },
];

function colorFor(type: TransformType) {
  if (type === "source") return "blue";
  if (type === "target") return "green";
  if (["router", "union", "joiner", "lookup", "updateStrategy"].includes(type)) return "amber";
  return "violet";
}
function borderClassFor(type: TransformType) {
  const c = colorFor(type);
  return c === "blue" ? "border-t-blue-500" : c === "green" ? "border-t-emerald-500" : c === "amber" ? "border-t-amber-500" : "border-t-violet-500";
}
function dotClassFor(type: TransformType) {
  const c = colorFor(type);
  return c === "blue" ? "bg-blue-500" : c === "green" ? "bg-emerald-500" : c === "amber" ? "bg-amber-500" : "bg-violet-500";
}

function defaultConfig(type: TransformType, headers: string[]): Record<string, any> {
  switch (type) {
    case "source":
      return { mode: "upload", fileName: "", rows: [], headers: [], connectionId: "", connectionName: "" };
    case "filter":
      return { column: headers[0] || "", op: "not_empty", value: "" };
    case "rename":
      return { from: headers[0] || "", to: "" };
    case "nulls":
      return { column: headers[0] || "", strategy: "drop_row" };
    case "expression":
      return { name: "new_column", expr: "" };
    case "sequence":
      return { outputColumn: "seq_id", startAt: 1, step: 1 };
    case "sorter":
      return { column: headers[0] || "", direction: "asc" };
    case "rank":
      return { column: headers[0] || "", outputColumn: "rank", direction: "desc" };
    case "aggregator":
      return { groupBy: headers[0] || "", targetColumn: headers[0] || "", fn: "sum" };
    case "router":
      return { column: headers[0] || "", routes: [] };
    case "union":
      return { referenceRows: [], referenceFileName: "" };
    case "joiner":
      return { referenceRows: [], leftKey: headers[0] || "", rightKey: "", joinType: "inner", referenceFileName: "" };
    case "lookup":
      return { referenceRows: [], key: headers[0] || "", lookupKey: "", copyColumns: [], referenceFileName: "" };
    case "updateStrategy":
      return { referenceRows: [], key: headers[0] || "", referenceFileName: "" };
    case "normalizer":
      return { pivotColumns: [], nameColumn: "field", valueColumn: "value", keepColumns: [] };
    case "target":
      return { mode: "preview", connectionId: "", connectionName: "", table: "", writeMode: "insert" };
    default:
      return {};
  }
}

export default function DesignerCanvas({
  pipelineId,
  initialPipeline,
}: {
  pipelineId: string;
  initialPipeline?: any;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialPipeline?.name || "Untitled pipeline");
  const [environment, setEnvironment] = useState(initialPipeline?.environment || "DEV");
  const [headers, setHeaders] = useState<string[]>(initialPipeline?.headers || []);
  const [nodes, setNodes] = useState<PipelineNode[]>(initialPipeline?.nodes || []);
  const [history, setHistory] = useState<PipelineNode[][]>([]);
  const [redoStack, setRedoStack] = useState<PipelineNode[][]>([]);
  const [promotedFrom] = useState<string | null>(initialPipeline?.promotedFrom || null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [log, setLog] = useState<RunLogStep[]>([]);
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState<{ rows: Row[]; headers: string[] } | null>(null);
  const [savedId, setSavedId] = useState<string | null>(pipelineId !== "new" ? pipelineId : null);
  const [toastMsg, setToastMsg] = useState("");
  const [connections, setConnections] = useState<any[]>([]);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [profileModalNodeId, setProfileModalNodeId] = useState<string | null>(null);
  const [aiSuggestNodeId, setAiSuggestNodeId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const counter = useRef(0);
  const dragState = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => setConnections(d.connections || []))
      .catch(() => {});
  }, []);

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  }


  // Undo/redo tracks structural changes (add/remove/generate) — not every drag
  // pixel or config keystroke, which would make the stack noisy and useless.
  // Call pushHistory(nodes) with the PRE-mutation state right before any
  // structural change.
  function pushHistory(preChangeNodes: PipelineNode[]) {
    setHistory((prev) => [...prev.slice(-49), JSON.parse(JSON.stringify(preChangeNodes))]);
    setRedoStack([]);
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prevState = h[h.length - 1];
      setRedoStack((r) => [...r, JSON.parse(JSON.stringify(nodes))]);
      setNodes(prevState);
      setSelectedId(null);
      return h.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const nextState = r[r.length - 1];
      setHistory((h) => [...h, JSON.parse(JSON.stringify(nodes))]);
      setNodes(nextState);
      setSelectedId(null);
      return r.slice(0, -1);
    });
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nodes]);

  function addNode(type: TransformType) {
    pushHistory(nodes);
    counter.current += 1;
    const idx = nodes.length;
    const node: PipelineNode = {
      id: `n${counter.current}_${Date.now()}`,
      type,
      label: TRANSFORM_LABELS[type],
      x: 40 + (idx % 4) * 220,
      y: 30 + Math.floor(idx / 4) * 150,
      config: defaultConfig(type, headers),
    };
    setNodes((prev) => [...prev, node]);
    setSelectedId(node.id);
  }

function addSuggestedNodes(suggestions: { type: TransformType; config: Record<string, any> }[]) {
    pushHistory(nodes);
    setNodes((prev) => {
      const startIdx = prev.length;
      const added = suggestions.map((s, i) => {
        counter.current += 1;
        const idx = startIdx + i;
        return {
          id: `n${counter.current}_${Date.now()}_${i}`,
          type: s.type,
          label: TRANSFORM_LABELS[s.type],
          x: 40 + (idx % 4) * 220,
          y: 30 + Math.floor(idx / 4) * 150,
          // merge over the default config so any field the model omitted still has a sane fallback
          config: { ...defaultConfig(s.type, headers), ...s.config },
        };
      });
      return [...prev, ...added];
    });
    toast(`Added ${suggestions.length} suggested step${suggestions.length !== 1 ? "s" : ""}`);
  }

function applyGeneratedPipeline(steps: { type: TransformType; config: Record<string, any> }[]) {
    pushHistory(nodes);
    setNodes((prev) => {
      // Keep Source nodes as-is, replace everything downstream with the generated chain.
      const sourceNodes = prev.filter((n) => n.type === "source");
      const startIdx = sourceNodes.length;
      const generated = steps.map((s, i) => {
        counter.current += 1;
        const idx = startIdx + i;
        return {
          id: `n${counter.current}_${Date.now()}_${i}`,
          type: s.type,
          label: TRANSFORM_LABELS[s.type],
          x: 40 + (idx % 4) * 220,
          y: 30 + Math.floor(idx / 4) * 150,
          config: { ...defaultConfig(s.type, headers), ...s.config },
        };
      });
      return [...sourceNodes, ...generated];
    });
setSelectedId(null);
    toast(`Generated a ${steps.length}-step pipeline`);
  }

  function applyCopilotOperations(ops: CopilotOperation[]) {
    pushHistory(nodes);
    setNodes((prev) => {
      let current = [...prev];
      for (const op of ops) {
        if (op.op === "add" && op.type) {
          counter.current += 1;
          const idx = current.length;
          current.push({
            id: `n${counter.current}_${Date.now()}`,
            type: op.type,
            label: TRANSFORM_LABELS[op.type],
            x: 40 + (idx % 4) * 220,
            y: 30 + Math.floor(idx / 4) * 150,
            config: { ...defaultConfig(op.type, headers), ...op.config },
          });
        } else if (op.op === "remove" && op.nodeId) {
          current = current.filter((n) => n.id !== op.nodeId);
        } else if (op.op === "update" && op.nodeId) {
          current = current.map((n) =>
            n.id === op.nodeId ? { ...n, config: { ...n.config, ...op.config } } : n
          );
        }
      }
      return current;
    });
    toast(`Applied ${ops.length} change${ops.length !== 1 ? "s" : ""} from copilot`);
  }

  function updateNodeConfig(id: string, patch: Record<string, any>) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, config: { ...n.config, ...patch } } : n)));
  }

 function removeNode(id: string) {
    pushHistory(nodes);
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

function onNodeMouseDown(e: React.MouseEvent, node: PipelineNode) {
    const nodeId = node.id;
    const startX = e.clientX;
    const startY = e.clientY;
    const ox = node.x;
    const oy = node.y;
    dragState.current = { id: nodeId, startX, startY, ox, oy };

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, x: Math.max(0, ox + dx), y: Math.max(0, oy + dy) } : n
        )
      );
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      dragState.current = null;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleSourceUpload(nodeId: string, file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsedHeaders = res.meta.fields || [];
        updateNodeConfig(nodeId, {
          mode: "upload",
          rows: res.data,
          headers: parsedHeaders,
          fileName: file.name,
          connectionId: "",
          connectionName: "",
        });
        setHeaders(parsedHeaders);
        toast(`${file.name} loaded — ${(res.data as any[]).length} rows`);
      },
    });
  }

  async function handleSourceConnection(nodeId: string, connectionId: string) {
    const conn = connections.find((c) => c._id === connectionId);
    if (!conn) return;
    toast("Fetching a sample from " + conn.name + "…");
    const res = await fetch(`/api/connections/${connectionId}/test`, { method: "POST" });
    const data = await res.json();
    if (data.testResult?.ok) {
      updateNodeConfig(nodeId, {
        mode: "connection",
        connectionId,
        connectionName: conn.name,
        rows: [], // resolved live at run time server-side
        sampleRows: data.testResult.rows || [], // small sample, used for the data profile only
        headers: data.testResult.headers,
        fileName: "",
      });
      setHeaders(data.testResult.headers || []);
      toast(`Connected — sample shows ${data.testResult.headers?.length || 0} columns`);
    } else {
      toast("Connection test failed: " + (data.testResult?.error || data.error));
    }
  }

  function handleReferenceUpload(nodeId: string, file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        updateNodeConfig(nodeId, {
          referenceRows: res.data,
          referenceHeaders: res.meta.fields || [],
          referenceFileName: file.name,
        });
      },
    });
  }

  async function savePipeline() {
    const payload = { name, environment, headers, nodes };
    if (savedId) {
      const res = await fetch(`/api/pipelines/${savedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast("Pipeline saved");
      return savedId;
    } else {
      const res = await fetch(`/api/pipelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedId(data.pipeline._id);
        toast("Pipeline created");
        router.replace(`/dashboard/designer/${data.pipeline._id}`);
        return data.pipeline._id;
      }
    }
    return null;
  }

    const NEXT_ENV: Record<string, string> = { DEV: "SIT", SIT: "PROD" };

  async function promotePipeline() {
    if (!savedId) {
      toast("Save the pipeline before promoting it");
      return;
    }
    const target = NEXT_ENV[environment];
    if (!target) {
      toast("PROD is the top of the chain — nothing to promote to");
      return;
    }
    setPromoting(true);
    const res = await fetch(`/api/pipelines/${savedId}/promote`, { method: "POST" });
    const data = await res.json();
    setPromoting(false);
    if (res.ok) {
      toast(data.wasUpdate ? `Re-promoted to ${target} (updated existing copy)` : `Promoted to ${target}`);
    } else {
      toast("Promote failed: " + data.error);
    }
  }


  async function runPipelineNow() {
    const hasSource = nodes.some((n) => n.type === "source" && (n.config?.rows?.length || n.config?.connectionId));
    if (!hasSource) {
      toast("Add a Source node and attach a CSV or connection first");
      return;
    }
    const idToUse = savedId || (await savePipeline());
    if (!idToUse) return;
    setRunning(true);
    setLog([]);
    const res = await fetch(`/api/pipelines/${idToUse}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json();
    setLog(data.steps || []);
    setPreview({ rows: data.rows || [], headers: data.headers || headers });
    setRunning(false);
    toast(data.status === "success" ? "Pipeline finished" : "Pipeline finished with errors");
  }

  const selected = nodes.find((n) => n.id === selectedId) || null;

  // return (
  //   <div className="grid grid-cols-[210px_1fr_290px] h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm">
  //     {/* PALETTE */}
  //     <div className="border-r border-[#E3E7EF] bg-white p-3 overflow-y-auto">
  //       <div className="mb-3">
  //         <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Pipeline name</label>
  //         <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
  //       </div>
  //       <div className="mb-4">
  //         <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Environment</label>
  //         <select className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
  //           <option>DEV</option>
  //           <option>SIT</option>
  //           <option>PROD</option>
  //         </select>
  //       </div>

  //       {TRANSFORM_GROUPS.map((g) => (
  //         <div key={g.title}>
  //           <h3 className="text-[10px] uppercase tracking-wide text-[#9AA1B2] mt-3 mb-1.5">{g.title}</h3>
  //           {g.types.map((t) => (
  //             <button
  //               key={t}
  //               onClick={() => addNode(t)}
  //               className="w-full flex items-center gap-2 text-xs font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1.5 hover:border-[#2F6FED] hover:bg-[#2F6FED0d] text-left"
  //             >
  //               <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
  //               {TRANSFORM_LABELS[t]}
  //               <span className="ml-auto text-[#9AA1B2]">+</span>
  //             </button>
  //           ))}
  //         </div>
  //       ))}
  //     </div>
      return (
    <div
      className="grid h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm"
      style={{ gridTemplateColumns: `${paletteCollapsed ? 52 : 210}px 1fr 290px` }}
    >
      {/* PALETTE */}
      <div className="border-r border-[#E3E7EF] bg-white p-2 overflow-y-auto relative">
        <button
          onClick={() => setPaletteCollapsed((v) => !v)}
          title={paletteCollapsed ? "Expand panel" : "Collapse panel — focus on the canvas"}
          className="w-full flex items-center justify-center border border-[#E3E7EF] rounded-lg py-1.5 mb-2 text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] text-xs"
        >
          {paletteCollapsed ? "»" : "« Focus mode"}
        </button>

        {paletteCollapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            {TRANSFORM_GROUPS.flatMap((g) => g.types).map((t) => (
              <button
                key={t}
                onClick={() => addNode(t)}
                title={TRANSFORM_LABELS[t]}
                className="w-8 h-8 rounded-lg border border-[#E3E7EF] flex items-center justify-center hover:border-[#2F6FED]"
              >
                <span className={`w-2.5 h-2.5 rounded-sm ${dotClassFor(t)}`} />
              </button>
            ))}
          </div>
        ) : (
          <div className="px-1">
        <div className="mb-3">
          <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Pipeline name</label>
          <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Environment</label>
          <select className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option>DEV</option>
            <option>SIT</option>
            <option>PROD</option>
          </select>
        </div>

        {TRANSFORM_GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="text-[10px] uppercase tracking-wide text-[#9AA1B2] mt-3 mb-1.5">{g.title}</h3>
            {g.types.map((t) => (
              <button
                key={t}
                onClick={() => addNode(t)}
                className="w-full flex items-center gap-2 text-xs font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1.5 hover:border-[#2F6FED] hover:bg-[#2F6FED0d] text-left"
              >
                <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
                {TRANSFORM_LABELS[t]}
                <span className="ml-auto text-[#9AA1B2]">+</span>
              </button>
            ))}
          </div>
        ))}
          </div>
        )}
      </div>
      {/* CANVAS */}
      <div className="relative overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #E3E7EF 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
        <div className="relative" style={{ width: 1400, height: 1000 }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.slice(0, -1).map((a, i) => {
              const b = nodes[i + 1];
              const x1 = a.x + 190, y1 = a.y + 35, x2 = b.x, y2 = b.y + 35, mid = (x1 + x2) / 2;
              return <path key={a.id} d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`} stroke="#2F6FED55" strokeWidth={2} fill="none" />;
            })}
          </svg>

          {nodes.length === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#6B7385] w-80">
              <h3 className="text-base font-semibold text-[#1A2233] mb-2">This pipeline is empty</h3>
              <p className="text-xs leading-relaxed">
                Start with a <b>Source</b> node (CSV or a saved connection), then add transforms, then finish with a <b>Target</b>.
              </p>
            </div>
          )}

          {nodes.map((n, i) => (
            <div
              key={n.id}
              onMouseDown={(e) => onNodeMouseDown(e, n)}
              onClick={() => setSelectedId(n.id)}
              className={`absolute w-[190px] bg-white border rounded-xl px-3.5 py-3 cursor-grab shadow-sm border-t-[3px] ${borderClassFor(n.type)} ${
                n.id === selectedId ? "border-[#2F6FED] ring-2 ring-[#2F6FED22]" : "border-[#E3E7EF]"
              }`}
              style={{ left: n.x, top: n.y }}
            >
              <div className="flex justify-between items-center text-[13px] font-semibold">
                <span>{n.label}</span>
                <StatusDot nodeId={n.id} log={log} />
              </div>
              <div className="text-[9.5px] font-mono text-[#9AA1B2] mt-0.5 uppercase tracking-wide">step {i + 1} · {n.type}</div>
              {n.type === "source" && (
                <div className="text-[10.5px] font-mono text-[#2F6FED] mt-1.5 truncate">
                  {n.config.connectionName || n.config.fileName || "not configured"}
                </div>
              )}
              <div className="text-[10.5px] font-mono text-[#9AA1B2] mt-1.5">
                <RowInfo nodeId={n.id} log={log} />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeNode(n.id); }}
                className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-white border border-[#E3E7EF] text-[10px] text-[#9AA1B2] hover:text-red-500 hover:border-red-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INSPECTOR */}
      <div className="border-l border-[#E3E7EF] bg-white p-4 overflow-y-auto">
        {!selected ? (
          <div className="text-[#6B7385] text-xs text-center mt-10">Select a node to configure it.</div>
        ) : (
 <NodeInspector
            node={selected}
            headers={headers}
            connections={connections}
            onChange={(patch) => updateNodeConfig(selected.id, patch)}
            onReferenceUpload={(file) => handleReferenceUpload(selected.id, file)}
            onSourceUpload={(file) => handleSourceUpload(selected.id, file)}
            onSourceConnection={(connId) => handleSourceConnection(selected.id, connId)}
            onOpenProfile={(nodeId) => setProfileModalNodeId(nodeId)}
            onOpenAiSuggest={(nodeId) => setAiSuggestNodeId(nodeId)}
          />
        )}

        <div className="mt-5 pt-4 border-t border-[#E3E7EF]">
          <h3 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] mb-2">Execution log</h3>
          {log.length === 0 ? (
            <div className="text-[11px] text-[#9AA1B2]">No runs yet.</div>
          ) : (
            <div className="space-y-1.5">
              {[...log].reverse().map((s, i) => (
                <div key={i} className={`text-[11px] font-mono bg-[#FAFBFD] rounded px-2 py-1.5 border-l-2 ${s.ok ? "border-emerald-500" : "border-red-500 text-red-600"}`}>
                  <div className="font-semibold text-[#1A2233]">{s.label}</div>
                  <div>{s.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* <div className="fixed top-3 right-6 flex gap-2 z-30">
        <button onClick={savePipeline} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save pipeline</button>
        <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
          {running ? "Running…" : "▶ Run pipeline"}
        </button>
      </div> */}

        <div className="fixed top-3 z-30 flex gap-1.5" style={{ left: (paletteCollapsed ? 52 : 210) + 16 }}>
        <button
          onClick={undo}
          disabled={history.length === 0}
          title="Undo (Ctrl+Z)"
          className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] bg-white rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30 disabled:hover:border-[#E3E7EF] disabled:hover:text-[#6B7385]"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Shift+Z)"
          className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] bg-white rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30 disabled:hover:border-[#E3E7EF] disabled:hover:text-[#6B7385]"
        >
          <Redo2 size={14} />
        </button>
      </div>

      <div className="fixed top-3 right-6 flex gap-2 z-30">
        {promotedFrom && (
          <button
            onClick={() => router.push(`/dashboard/pipelines/diff/${savedId}`)}
            className="text-xs font-semibold border border-[#E3E7EF] text-[#6B7385] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]"
          >
            View diff vs source →
          </button>
        )}
        <button
          onClick={() => {
            const hasSource = nodes.some((n) => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
            if (!hasSource) { toast("Add a Source node with data first"); return; }
            setShowGenerateModal(true);
          }}
          className="text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] bg-white rounded-lg px-3.5 py-2 hover:bg-[#7C6AE814] flex items-center gap-1.5"
        >
          ✨ Generate from prompt
        </button>
        <button
          onClick={() => setShowCopilot((v) => !v)}
          className={`text-xs font-semibold border rounded-lg px-3.5 py-2 flex items-center gap-1.5 transition-colors ${
            showCopilot
              ? "border-[#7C6AE8] bg-[#7C6AE8] text-white"
              : "border-[#7C6AE8] text-[#7C6AE8] bg-white hover:bg-[#7C6AE814]"
          }`}
        >
          💬 {showCopilot ? "Close copilot" : "Copilot"}
        </button>
        {environment !== "PROD" && (
          <button onClick={promotePipeline} disabled={promoting} className="text-xs font-semibold border border-[#D98A1E] text-[#D98A1E] bg-white rounded-lg px-3.5 py-2 hover:bg-[#D98A1E14] disabled:opacity-50">
            {promoting ? "Promoting…" : `Promote to ${environment === "DEV" ? "SIT" : "PROD"} →`}
          </button>
        )}
        <button onClick={savePipeline} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save pipeline</button>
        <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
          {running ? "Running…" : "▶ Run pipeline"}
        </button>
      </div>

      {preview && (
        <div className="fixed bottom-0 right-[290px] bg-white border-t border-[#E3E7EF] max-h-64 overflow-hidden z-20" style={{ left: paletteCollapsed ? 52 : 210 }}>
          <div className="flex justify-between items-center px-4 py-2 border-b border-[#E3E7EF]">
            <h3 className="text-xs font-semibold">Output preview — {preview.rows.length} rows total, showing {Math.min(25, preview.rows.length)}</h3>
            <div className="flex gap-2">
              <button onClick={() => downloadOutput(preview, "csv", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ CSV</button>
              <button onClick={() => downloadOutput(preview, "json", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ JSON</button>
              <button onClick={() => setPreview(null)} className="text-xs border border-[#E3E7EF] rounded px-2 py-1">Close</button>
            </div>
          </div>
          <div className="overflow-auto p-3" style={{ maxHeight: 200 }}>
<table className="text-xs w-full">
  <thead>
    <tr>{preview.headers.map((h, hi) => <th key={`${h}_${hi}`} className="text-left px-2.5 py-1.5 text-[#2F6FED] font-mono font-medium whitespace-nowrap">{h}</th>)}</tr>
  </thead>
              <tbody>
                {preview.rows.slice(0, 25).map((r, i) => (
                   <tr key={i}>{preview.headers.map((h, hi) => <td key={`${h}_${hi}`} className="px-2.5 py-1.5 text-[#6B7385] whitespace-nowrap border-t border-[#F0F2F6]">{String(r[h] ?? "")}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

{toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A2233] text-white text-xs px-4 py-2.5 rounded-lg z-50">{toastMsg}</div>}

{profileModalNodeId && (() => {
        const profileNode = nodes.find((n) => n.id === profileModalNodeId);
        if (!profileNode) return null;
        const isSample = profileNode.config.mode === "connection";
        const profileRows = isSample ? profileNode.config.sampleRows || [] : profileNode.config.rows || [];
        return (
          <DataProfileModal
            rows={profileRows}
            headers={headers}
            isSample={isSample}
            onClose={() => setProfileModalNodeId(null)}
          />
        );
      })()}
      
{aiSuggestNodeId && (() => {
        const srcNode = nodes.find((n) => n.id === aiSuggestNodeId);
        if (!srcNode) return null;
        const isSample = srcNode.config.mode === "connection";
        const dataRows = isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || [];
        return (
          <AiSuggestModal
            rows={dataRows}
            headers={headers}
            onAddNodes={addSuggestedNodes}
            onClose={() => setAiSuggestNodeId(null)}
          />
        );
      })()}

      {showGenerateModal && (() => {
        const srcNode = nodes.find((n) => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
        const isSample = srcNode?.config.mode === "connection";
        const dataRows = srcNode ? (isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || []) : [];
        const hasExistingSteps = nodes.some((n) => n.type !== "source");
        return (
          <AiGeneratePipelineModal
            rows={dataRows}
            headers={headers}
            hasExistingSteps={hasExistingSteps}
            onApply={applyGeneratedPipeline}
            onClose={() => setShowGenerateModal(false)}
          />
        );
      })()}

            {showCopilot && (
        <CopilotChat
          nodes={nodes}
          headers={headers}
          onApplyOperations={applyCopilotOperations}
          onClose={() => setShowCopilot(false)}
        />
      )}
    </div>
  );
}
function downloadOutput(preview: { rows: Row[]; headers: string[] }, format: "csv" | "json", pipelineName: string) {
  let content: string;
  let mime: string;
  let ext: string;

  if (format === "json") {
    content = JSON.stringify(preview.rows, null, 2);
    mime = "application/json";
    ext = "json";
  } else {
    const escape = (v: any) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [preview.headers.join(",")];
    for (const row of preview.rows) {
      lines.push(preview.headers.map((h) => escape(row[h])).join(","));
    }
    content = lines.join("\n");
    mime = "text/csv";
    ext = "csv";
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${pipelineName.replace(/\s+/g, "_")}_output.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusDot({ nodeId, log }: { nodeId: string; log: RunLogStep[] }) {
  const entry = log.find((l) => l.nodeId === nodeId);
  if (!entry) return <span className="w-[7px] h-[7px] rounded-full bg-[#E3E7EF]" />;
  return <span className={`w-[7px] h-[7px] rounded-full ${entry.ok ? "bg-emerald-500" : "bg-red-500"}`} />;
}
function RowInfo({ nodeId, log }: { nodeId: string; log: RunLogStep[] }) {
  const entry = log.find((l) => l.nodeId === nodeId);
  if (!entry) return <>not yet run</>;
  return <>{entry.rowsOut} rows</>;
}

function NodeInspector({
  node,
  headers,
  connections,
  onChange,
  onReferenceUpload,
  onSourceUpload,
  onSourceConnection,
  onOpenProfile,
  onOpenAiSuggest,
}: {
  node: PipelineNode;
  headers: string[];
  connections: any[];
  onChange: (patch: Record<string, any>) => void;
  onReferenceUpload: (file: File) => void;
  onSourceUpload: (file: File) => void;
  onSourceConnection: (connectionId: string) => void;
  onOpenProfile: (nodeId: string) => void;
  onOpenAiSuggest: (nodeId: string) => void;
}) {

  const cfg = node.config || {};
  const selectCls = "w-full border border-[#E3E7EF] bg-[#FAFBFD] rounded px-2 py-1.5 text-xs";
  const labelCls = "block text-[11px] font-mono text-[#6B7385] mb-1";

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-3"><label className={labelCls}>{label}</label>{children}</div>
  );

  const refUploader = (
    <Field label={cfg.referenceFileName ? `Reference file: ${cfg.referenceFileName}` : "Reference CSV"}>
      <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-2 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
        {cfg.referenceFileName ? "Replace file" : "Upload reference CSV"}
        <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReferenceUpload(f); }} />
      </label>
    </Field>
  );

  const refHeaders: string[] = cfg.referenceHeaders || [];

  return (
    <div>
      <h3 className="text-sm font-semibold">{node.label}</h3>
      <div className="text-[11px] font-mono text-[#9AA1B2] mb-3">step config</div>

      {node.type === "source" && (
        <>
          <Field label="Source type">
            <div className="flex gap-1.5 mb-2">
              <button onClick={() => onChange({ mode: "upload" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "upload" || !cfg.mode ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>CSV upload</button>
              <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Saved connection</button>
            </div>
          </Field>
          {cfg.mode === "connection" ? (
            <Field label="Connection">
              <select className={selectCls} value={cfg.connectionId || ""} onChange={(e) => onSourceConnection(e.target.value)}>
                <option value="">Select a connection…</option>
                {connections.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}
              </select>
              {connections.length === 0 && <p className="text-[11px] text-[#6B7385] mt-1.5">No connections yet — add one on the Connections page.</p>}
            </Field>
 ) : (
            <Field label={cfg.fileName ? `Loaded: ${cfg.fileName}` : "CSV file"}>
              <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-3 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
                {cfg.fileName ? `✓ ${cfg.rows?.length || 0} rows — replace file` : "Upload CSV"}
                <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSourceUpload(f); }} />
              </label>
            </Field>
          )}
{((cfg.mode === "upload" && cfg.rows?.length) || (cfg.mode === "connection" && cfg.sampleRows?.length)) ? (
            <>
              <button onClick={() => onOpenProfile(node.id)} className="w-full text-xs font-semibold border border-[#E3E7EF] rounded-lg py-2 mt-1 hover:border-[#2F6FED] hover:text-[#2F6FED]">
                📊 View data profile
              </button>
              <button onClick={() => onOpenAiSuggest(node.id)} className="w-full text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] rounded-lg py-2 mt-2 hover:bg-[#7C6AE814]">
                ✨ Suggest transforms (AI)
              </button>
            </>
          ) : null}
        </>
      )}

      {node.type === "filter" && (
        <>
          <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Condition">
            <select className={selectCls} value={cfg.op} onChange={(e) => onChange({ op: e.target.value })}>
              <option value="not_empty">Is not empty</option>
              <option value="empty">Is empty</option>
              <option value="gt">Greater than</option>
              <option value="lt">Less than</option>
              <option value="eq">Equals</option>
              <option value="neq">Not equals</option>
              <option value="contains">Contains</option>
            </select>
          </Field>
          {["gt", "lt", "eq", "neq", "contains"].includes(cfg.op) && (
            <Field label="Value"><input className={selectCls} value={cfg.value || ""} onChange={(e) => onChange({ value: e.target.value })} /></Field>
          )}
        </>
      )}

      {node.type === "rename" && (
        <>
          <Field label="From column"><select className={selectCls} value={cfg.from} onChange={(e) => onChange({ from: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="To (new name)"><input className={selectCls} value={cfg.to || ""} onChange={(e) => onChange({ to: e.target.value })} placeholder="e.g. customer_name" /></Field>
        </>
      )}

      {node.type === "nulls" && (
        <>
          <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Strategy">
            <select className={selectCls} value={cfg.strategy} onChange={(e) => onChange({ strategy: e.target.value })}>
              <option value="drop_row">Drop row</option>
              <option value="fill_zero">Fill with 0</option>
              <option value="fill_na">Fill with N/A</option>
            </select>
          </Field>
        </>
      )}

      {node.type === "expression" && (
        <>
          <Field label="New column name"><input className={selectCls} value={cfg.name || ""} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. total_price" /></Field>
          <Field label="Expression (use column names as variables)"><input className={selectCls} value={cfg.expr || ""} onChange={(e) => onChange({ expr: e.target.value })} placeholder="e.g. price * quantity" /></Field>
        </>
      )}


      {node.type === "sequence" && (
        <>
          <Field label="Output column name"><input className={selectCls} value={cfg.outputColumn || ""} onChange={(e) => onChange({ outputColumn: e.target.value })} placeholder="e.g. surrogate_key" /></Field>
          <Field label="Start at"><input type="number" className={selectCls} value={cfg.startAt ?? 1} onChange={(e) => onChange({ startAt: Number(e.target.value) })} /></Field>
          <Field label="Step"><input type="number" className={selectCls} value={cfg.step ?? 1} onChange={(e) => onChange({ step: Number(e.target.value) })} /></Field>
          <p className="text-[11px] text-[#6B7385] leading-relaxed">Adds an auto-incrementing column — useful for generating surrogate keys before loading into a Target.</p>
        </>
      )}


      {node.type === "sorter" && (
        <>
          <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={(e) => onChange({ direction: e.target.value })}><option value="asc">Ascending</option><option value="desc">Descending</option></select></Field>
        </>
      )}

      {node.type === "rank" && (
        <>
          <Field label="Rank by column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Output column name"><input className={selectCls} value={cfg.outputColumn || ""} onChange={(e) => onChange({ outputColumn: e.target.value })} /></Field>
          <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={(e) => onChange({ direction: e.target.value })}><option value="desc">Highest = rank 1</option><option value="asc">Lowest = rank 1</option></select></Field>
        </>
      )}

      {node.type === "aggregator" && (
        <>
          <Field label="Group by column"><select className={selectCls} value={cfg.groupBy} onChange={(e) => onChange({ groupBy: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Target column"><select className={selectCls} value={cfg.targetColumn} onChange={(e) => onChange({ targetColumn: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Function"><select className={selectCls} value={cfg.fn} onChange={(e) => onChange({ fn: e.target.value })}><option value="sum">Sum</option><option value="avg">Average</option><option value="count">Count</option><option value="min">Min</option><option value="max">Max</option></select></Field>
        </>
      )}

      {node.type === "router" && (
        <>
          <Field label="Column to route on"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <p className="text-[11px] text-[#6B7385] leading-relaxed">Rows get tagged with a <code>route</code> column based on rules below.</p>
          {(cfg.routes || []).map((rt: any, i: number) => (
            <div key={i} className="flex gap-1.5 mt-2">
              <input className="w-1/2 border border-[#E3E7EF] rounded px-2 py-1 text-xs" placeholder="route name" value={rt.name} onChange={(e) => { const routes = [...cfg.routes]; routes[i] = { ...routes[i], name: e.target.value }; onChange({ routes }); }} />
              <input className="w-1/2 border border-[#E3E7EF] rounded px-2 py-1 text-xs" placeholder="matches value" value={rt.value} onChange={(e) => { const routes = [...cfg.routes]; routes[i] = { ...routes[i], value: e.target.value }; onChange({ routes }); }} />
            </div>
          ))}
          <button className="text-xs text-[#2F6FED] mt-2" onClick={() => onChange({ routes: [...(cfg.routes || []), { name: "", value: "" }] })}>+ Add route</button>
        </>
      )}

      {node.type === "union" && <>{refUploader}</>}

      {node.type === "joiner" && (
        <>
          {refUploader}
          <Field label="Left key (this pipeline)"><select className={selectCls} value={cfg.leftKey} onChange={(e) => onChange({ leftKey: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Right key (reference CSV)"><select className={selectCls} value={cfg.rightKey} onChange={(e) => onChange({ rightKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Join type"><select className={selectCls} value={cfg.joinType} onChange={(e) => onChange({ joinType: e.target.value })}><option value="inner">Inner join</option><option value="left">Left join</option></select></Field>
        </>
      )}

      {node.type === "lookup" && (
        <>
          {refUploader}
          <Field label="Key in this pipeline"><select className={selectCls} value={cfg.key} onChange={(e) => onChange({ key: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Key in reference CSV"><select className={selectCls} value={cfg.lookupKey} onChange={(e) => onChange({ lookupKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <p className="text-[11px] text-[#6B7385] mt-1">Columns to copy from the reference row (comma separated):</p>
          <input className={selectCls + " mt-1"} placeholder="e.g. price, category" value={(cfg.copyColumns || []).join(", ")} onChange={(e) => onChange({ copyColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        </>
      )}

      {node.type === "updateStrategy" && (
        <>
          {refUploader}
          <Field label="Key column (identifies a record)"><select className={selectCls} value={cfg.key} onChange={(e) => onChange({ key: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
          <p className="text-[11px] text-[#6B7385] leading-relaxed">Compares each row against the reference snapshot and tags it INSERT / UPDATE / NOCHANGE / DELETE.</p>
        </>
      )}

      {node.type === "normalizer" && (
        <>
          <p className="text-[11px] text-[#6B7385] mb-2">Unpivot: turn repeating columns into rows.</p>
          <Field label="Columns to unpivot (comma separated)"><input className={selectCls} placeholder="e.g. jan_sales, feb_sales, mar_sales" value={(cfg.pivotColumns || []).join(", ")} onChange={(e) => onChange({ pivotColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
          <Field label="Columns to keep (comma separated)"><input className={selectCls} placeholder="e.g. customer_id, region" value={(cfg.keepColumns || []).join(", ")} onChange={(e) => onChange({ keepColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
          <Field label="Name column"><input className={selectCls} value={cfg.nameColumn || ""} onChange={(e) => onChange({ nameColumn: e.target.value })} /></Field>
          <Field label="Value column"><input className={selectCls} value={cfg.valueColumn || ""} onChange={(e) => onChange({ valueColumn: e.target.value })} /></Field>
        </>
      )}

  {node.type === "target" && (
        <>
          <Field label="Destination">
            <div className="flex gap-1.5 mb-2">
              <button onClick={() => onChange({ mode: "preview" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode !== "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Preview only</button>
              <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Write to DB</button>
            </div>
          </Field>
          {cfg.mode === "connection" ? (
            <>
              <Field label="Connection (Postgres / MySQL only)">
                <select
                  className={selectCls}
                  value={cfg.connectionId || ""}
                  onChange={(e) => {
                    const c = connections.find((x) => x._id === e.target.value);
                    onChange({ connectionId: e.target.value, connectionName: c?.name || "" });
                  }}
                >
                  <option value="">Select a connection…</option>
                  {connections.filter((c) => c.type === "postgres" || c.type === "mysql").map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
                  ))}
                </select>
                {connections.filter((c) => c.type === "postgres" || c.type === "mysql").length === 0 && (
                  <p className="text-[11px] text-[#6B7385] mt-1.5">No Postgres/MySQL connections yet — add one on the Connections page.</p>
                )}
              </Field>
              <Field label="Target table">
                <input className={selectCls} value={cfg.table || ""} onChange={(e) => onChange({ table: e.target.value })} placeholder="e.g. customers_clean" />
              </Field>
              <Field label="Write mode">
                <select className={selectCls} value={cfg.writeMode || "insert"} onChange={(e) => onChange({ writeMode: e.target.value })}>
                  <option value="insert">Insert (append rows)</option>
                  <option value="truncate_insert">Truncate table, then insert</option>
                </select>
              </Field>
              <p className="text-[11px] text-[#6B7385] leading-relaxed">The table must already exist with matching column names — this writes rows into it, it doesn't create the table.</p>
            </>
          ) : (
            <p className="text-[11px] text-[#6B7385]">Run the pipeline to preview output, or export it as CSV/JSON from the preview panel. No database write happens in this mode.</p>
          )}
        </>
      )}
    </div>
  );
}