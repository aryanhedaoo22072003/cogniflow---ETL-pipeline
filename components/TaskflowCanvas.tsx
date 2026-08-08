"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TaskflowNodeType = "start" | "task" | "end";
interface TaskflowNode {
  id: string;
  type: TaskflowNodeType;
  x: number;
  y: number;
  config: Record<string, any>;
}
interface StepResult {
  nodeId: string;
  status: "success" | "failed";
  pipelineName?: string;
  error?: string;
}

function colorFor(type: TaskflowNodeType) {
  if (type === "start") return "blue";
  if (type === "end") return "green";
  return "violet";
}
function borderClassFor(type: TaskflowNodeType) {
  const c = colorFor(type);
  return c === "blue" ? "border-t-blue-500" : c === "green" ? "border-t-emerald-500" : "border-t-violet-500";
}

export default function TaskflowCanvas({ taskflowId, initialTaskflow }: { taskflowId: string; initialTaskflow?: any }) {
  const router = useRouter();
  const [name, setName] = useState(initialTaskflow?.name || "Untitled taskflow");
  const [stopOnFailure, setStopOnFailure] = useState(initialTaskflow?.stopOnFailure ?? true);
  const [nodes, setNodes] = useState<TaskflowNode[]>(
    initialTaskflow?.nodes?.length
      ? initialTaskflow.nodes
      : [
          { id: "start", type: "start", x: 40, y: 140, config: {} },
          { id: "end", type: "end", x: 700, y: 140, config: {} },
        ]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [savedId, setSavedId] = useState<string | null>(taskflowId !== "new" ? taskflowId : null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const counter = useRef(0);
  const dragState = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    fetch("/api/pipelines").then((r) => r.json()).then((d) => setPipelines(d.pipelines || []));
  }, []);

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  }

  const orderedNodes = [...nodes].sort((a, b) => {
    if (a.type === "start") return -1;
    if (b.type === "start") return 1;
    if (a.type === "end") return 1;
    if (b.type === "end") return -1;
    return a.x - b.x;
  });

  function addTaskNode() {
    counter.current += 1;
    const id = `task_${counter.current}_${Date.now()}`;
    const taskCount = nodes.filter((n) => n.type === "task").length;
    const node: TaskflowNode = {
      id,
      type: "task",
      x: 220 + taskCount * 190,
      y: 140,
      config: { pipelineId: "", pipelineName: "", continueOnFailure: false },
    };
    setNodes((prev) => [...prev, node]);
    setSelectedId(id);
  }

  function updateNodeConfig(id: string, patch: Record<string, any>) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, config: { ...n.config, ...patch } } : n)));
  }

  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

function onNodeMouseDown(e: React.MouseEvent, node: TaskflowNode) {
    if (node.type !== "task") return;
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
          n.id === nodeId ? { ...n, x: Math.max(150, ox + dx), y: Math.max(0, oy + dy) } : n
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

  async function saveTaskflow() {
    const payload = { name, nodes, stopOnFailure };
    if (savedId) {
      await fetch(`/api/taskflows/${savedId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      toast("Taskflow saved");
      return savedId;
    } else {
      const res = await fetch(`/api/taskflows`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      setSavedId(data.taskflow._id);
      toast("Taskflow created");
      router.replace(`/dashboard/taskflows/${data.taskflow._id}`);
      return data.taskflow._id;
    }
  }

  async function runTaskflow() {
    const taskNodes = nodes.filter((n) => n.type === "task");
    if (taskNodes.some((n) => !n.config.pipelineId)) {
      toast("Every task node needs a pipeline selected");
      return;
    }
    const id = savedId || (await saveTaskflow());
    if (!id) return;
    setRunning(true);
    setResults([]);
    const res = await fetch(`/api/taskflows/${id}/run`, { method: "POST" });
    const data = await res.json();
    setResults((data.results || []).map((r: any) => ({ nodeId: r.nodeId, status: r.status, pipelineName: r.pipelineName, error: r.error })));
    setRunning(false);
    toast(data.status === "success" ? "Taskflow finished" : "Taskflow finished with errors");
  }

  const selected = nodes.find((n) => n.id === selectedId) || null;

  return (
    <div className="grid grid-cols-[1fr_280px] h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm">
      <div className="relative overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #E3E7EF 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
        <div className="relative" style={{ width: Math.max(1000, 260 + nodes.filter((n) => n.type === "task").length * 190), height: 320 }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {orderedNodes.slice(0, -1).map((a, i) => {
              const b = orderedNodes[i + 1];
              const x1 = a.x + 150, y1 = a.y + 30, x2 = b.x, y2 = b.y + 30, mid = (x1 + x2) / 2;
              return <path key={a.id} d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`} stroke="#7C6AE855" strokeWidth={2} fill="none" />;
            })}
          </svg>

          {nodes.map((n) => (
            <div
              key={n.id}
              onMouseDown={(e) => onNodeMouseDown(e, n)}
              onClick={() => setSelectedId(n.id)}
              className={`absolute w-[150px] bg-white border rounded-xl px-3.5 py-3 shadow-sm border-t-[3px] ${borderClassFor(n.type)} ${n.type === "task" ? "cursor-grab" : "cursor-default"} ${
                n.id === selectedId ? "border-[#2F6FED] ring-2 ring-[#2F6FED22]" : "border-[#E3E7EF]"
              }`}
              style={{ left: n.x, top: n.y }}
            >
              <div className="flex justify-between items-center text-[13px] font-semibold">
                <span>{n.type === "start" ? "Start" : n.type === "end" ? "End" : n.config.pipelineName || "Select pipeline"}</span>
                <ResultDot nodeId={n.id} results={results} />
              </div>
              {n.type === "task" && (
                <div className="text-[9.5px] font-mono text-[#9AA1B2] mt-1 uppercase tracking-wide">
                  Mapping Task{n.config.continueOnFailure ? " · continues on fail" : ""}
                </div>
              )}
              {n.type === "task" && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeNode(n.id); }}
                  className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-white border border-[#E3E7EF] text-[10px] text-[#9AA1B2] hover:text-red-500 hover:border-red-400 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-l border-[#E3E7EF] bg-white p-4 overflow-y-auto">
        <div className="mb-3">
          <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Taskflow name</label>
          <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-xs text-[#6B7385] mb-4">
          <input type="checkbox" checked={stopOnFailure} onChange={(e) => setStopOnFailure(e.target.checked)} />
          Stop whole flow if a task fails (unless that task allows continue)
        </label>

        <button onClick={addTaskNode} className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2.5 mb-4 hover:border-[#2F6FED] hover:text-[#2F6FED]">
          + Add Mapping Task
        </button>

        {!selected || selected.type !== "task" ? (
          <div className="text-[#6B7385] text-xs text-center mt-6">
            {nodes.filter((n) => n.type === "task").length === 0
              ? "Add a Mapping Task, then click it to choose which pipeline it runs."
              : "Select a Mapping Task node to configure it."}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold mb-3">Mapping Task</h3>
            <div className="mb-3">
              <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Pipeline</label>
              <select
                className="w-full border border-[#E3E7EF] bg-[#FAFBFD] rounded px-2 py-1.5 text-xs"
                value={selected.config.pipelineId}
                onChange={(e) => {
                  const p = pipelines.find((pl) => pl._id === e.target.value);
                  updateNodeConfig(selected.id, { pipelineId: e.target.value, pipelineName: p?.name || "" });
                }}
              >
                <option value="">Select a pipeline…</option>
                {pipelines.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <label className="flex items-start gap-2 text-[11.5px] text-[#6B7385]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={!!selected.config.continueOnFailure}
                onChange={(e) => updateNodeConfig(selected.id, { continueOnFailure: e.target.checked })}
              />
              Continue the taskflow even if this task fails
            </label>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E3E7EF]">
            <h3 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] mb-2">Last run</h3>
            <div className="space-y-1.5">
              {results.map((r, i) => (
                <div key={i} className={`text-[11px] font-mono bg-[#FAFBFD] rounded px-2 py-1.5 border-l-2 ${r.status === "success" ? "border-emerald-500" : "border-red-500 text-red-600"}`}>
                  <div className="font-semibold text-[#1A2233]">{r.pipelineName || r.nodeId}</div>
                  <div>{r.status}{r.error ? ` — ${r.error}` : ""}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-3 right-6 flex gap-2 z-30">
        <button onClick={saveTaskflow} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save taskflow</button>
        <button onClick={runTaskflow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
          {running ? "Running…" : "▶ Run taskflow"}
        </button>
      </div>

      {toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A2233] text-white text-xs px-4 py-2.5 rounded-lg z-50">{toastMsg}</div>}
    </div>
  );
}

function ResultDot({ nodeId, results }: { nodeId: string; results: StepResult[] }) {
  const r = results.find((x) => x.nodeId === nodeId);
  if (!r) return <span className="w-[7px] h-[7px] rounded-full bg-[#E3E7EF]" />;
  return <span className={`w-[7px] h-[7px] rounded-full ${r.status === "success" ? "bg-emerald-500" : "bg-red-500"}`} />;
}