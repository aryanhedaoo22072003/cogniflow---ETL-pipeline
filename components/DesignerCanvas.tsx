// /*------change the dashboard need to add dark mode */
// "use client";

// import { useEffect, useRef, useState } from "react";
// import Papa from "papaparse";
// import { useRouter } from "next/navigation";
// import { Undo2, Redo2 } from "lucide-react";
// import type { PipelineNode, RunLogStep } from "@/lib/transforms";

// import DataProfileModal from "@/components/DataProfileModal";
// import AiSuggestModal from "@/components/AiSuggestModal";
// import AiGeneratePipelineModal from "@/components/AiGeneratePipelineModal";
// import CopilotChat, { CopilotOperation } from "@/components/CopilotChat";
// import { TRANSFORM_LABELS, TransformType } from "@/lib/transforms";
// import { Edge, autoWire } from "@/lib/graphUtils";

// type Row = Record<string, any>;



// const TRANSFORM_GROUPS: { title: string; types: TransformType[] }[] = [
//   { title: "Source", types: ["source"] },
//   { title: "Row & Column Ops", types: ["filter", "rename", "dedupe", "nulls", "expression"] },
//    { title: "Generate", types: ["sequence"] },
//   { title: "Sort & Aggregate", types: ["sorter", "rank", "aggregator"] },
//   { title: "Multi-source", types: ["router", "union", "joiner", "lookup", "updateStrategy"] },
//   { title: "Restructure", types: ["normalizer"] },
//   { title: "Target", types: ["target"] },
//   {
//     title: "SCD",
//     types: ["scd1", "scd2", "scd3"] as TransformType[],
//   },
// ];

// function colorFor(type: TransformType) {
//   if (type === "source") return "blue";
//   if (type === "target") return "green";
//   if (["router", "union", "joiner", "lookup", "updateStrategy"].includes(type)) return "amber";
//   return "violet";
// }
// function borderClassFor(type: TransformType) {
//   const c = colorFor(type);
//   return c === "blue" ? "border-t-blue-500" : c === "green" ? "border-t-emerald-500" : c === "amber" ? "border-t-amber-500" : "border-t-violet-500";
// }
// function dotClassFor(type: TransformType) {
  
//   const c = colorFor(type);
  
//   return c === "blue" ? "bg-blue-500" : c === "green" ? "bg-emerald-500" : c === "amber" ? "bg-amber-500" : "bg-violet-500";
  
// }

// function defaultConfig(type: TransformType, headers: string[]): Record<string, any> {
//   switch (type) {
//     case "source":
//       return { mode: "upload", fileName: "", rows: [], headers: [], connectionId: "", connectionName: "" };
//     case "filter":
//       return { column: headers[0] || "", op: "not_empty", value: "" };
//     case "rename":
//       return { from: headers[0] || "", to: "" };
//     case "nulls":
//       return { column: headers[0] || "", strategy: "drop_row" };
//     case "expression":
//       return {
//         outputPorts: [{ name: "", expr: "" }],
//         variablePorts: [],
//         inputMacros: [],
//         outputMacros: [],
//         _tab: "output",
//       };
//     case "sequence":
//       return { outputColumn: "seq_id", startAt: 1, step: 1 };
//     case "sorter":
//       return { column: headers[0] || "", direction: "asc" };
//     case "rank":
//       return { column: headers[0] || "", outputColumn: "rank", direction: "desc" };
//     case "aggregator":
//       return { groupBy: headers[0] || "", targetColumn: headers[0] || "", fn: "sum" };
//     case "router":
//       return { column: headers[0] || "", routes: [] };
//     case "union":
//       return { referenceRows: [], referenceFileName: "" };
//     case "joiner":
//       return { referenceRows: [], leftKey: headers[0] || "", rightKey: "", joinType: "inner", referenceFileName: "" };
//     case "lookup":
//       return { referenceRows: [], key: headers[0] || "", lookupKey: "", copyColumns: [], referenceFileName: "" };
//     case "updateStrategy":
//       return { referenceRows: [], key: headers[0] || "", referenceFileName: "" };
//     case "normalizer":
//       return { pivotColumns: [], nameColumn: "field", valueColumn: "value", keepColumns: [] };
//     case "target":
//       return { mode: "preview", connectionId: "", connectionName: "", table: "", writeMode: "insert" };
//     case "scd1":
//       return { keyColumn: "", compareColumns: [], snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
//     case "scd2":
//       return { keyColumn: "", compareColumns: [], surrogateColumn: "surrogate_key", snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
//     case "scd3":
//       return { keyColumn: "", compareColumns: [], snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
//     default:
//       return {};
//   }
// }

// export default function DesignerCanvas({
//   pipelineId,
//   initialPipeline,
// }: {
//   pipelineId: string;
//   initialPipeline?: any;
// }) {
//   const router = useRouter();
//   const [name, setName] = useState(initialPipeline?.name || "Untitled pipeline");
//   const [environment, setEnvironment] = useState(initialPipeline?.environment || "DEV");
//   const [headers, setHeaders] = useState<string[]>(initialPipeline?.headers || []);
//   const [nodes, setNodes] = useState<PipelineNode[]>(initialPipeline?.nodes || []);
//   const [edges, setEdges] = useState<Edge[]>(
//     initialPipeline?.edges?.length
//       ? initialPipeline.edges
//       : autoWire(initialPipeline?.nodes || [])
//   );
//   const [history, setHistory] = useState<PipelineNode[][]>([]);
//   const [redoStack, setRedoStack] = useState<PipelineNode[][]>([]);
//   const [promotedFrom] = useState<string | null>(initialPipeline?.promotedFrom || null);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [log, setLog] = useState<RunLogStep[]>([]);
//   const [running, setRunning] = useState(false);
//     const [draggingWire, setDraggingWire] = useState<{
//     fromNodeId: string;
//     fromX: number;
//     fromY: number;
//     mouseX: number;
//     mouseY: number;
//   } | null>(null);
//   const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; side: "in" | "out" } | null>(null);
//   const [preview, setPreview] = useState<{ rows: Row[]; headers: string[] } | null>(null);
//   const [savedId, setSavedId] = useState<string | null>(pipelineId !== "new" ? pipelineId : null);
//   const [toastMsg, setToastMsg] = useState("");
//   const [connections, setConnections] = useState<any[]>([]);
//   const [paletteCollapsed, setPaletteCollapsed] = useState(false);
//   const [promoting, setPromoting] = useState(false);
//   const [profileModalNodeId, setProfileModalNodeId] = useState<string | null>(null);
//   const [aiSuggestNodeId, setAiSuggestNodeId] = useState<string | null>(null);
//   const [showGenerateModal, setShowGenerateModal] = useState(false);
//   const [showCopilot, setShowCopilot] = useState(false);
//   const counter = useRef(0);
//   const dragState = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  
//   useEffect(() => {
//     fetch("/api/connections")
//       .then((r) => r.json())
//       .then((d) => setConnections(d.connections || []))
//       .catch(() => {});
//   }, []);

//   function toast(msg: string) {
//     setToastMsg(msg);
//     setTimeout(() => setToastMsg(""), 2600);
//   }


//   // Undo/redo tracks structural changes (add/remove/generate) — not every drag
//   // pixel or config keystroke, which would make the stack noisy and useless.
//   // Call pushHistory(nodes) with the PRE-mutation state right before any
//   // structural change.
//   function pushHistory(preChangeNodes: PipelineNode[]) {
//     setHistory((prev) => [...prev.slice(-49), JSON.parse(JSON.stringify(preChangeNodes))]);
//     setRedoStack([]);
//   }

//   function undo() {
//     setHistory((h) => {
//       if (h.length === 0) return h;
//       const prevState = h[h.length - 1];
//       setRedoStack((r) => [...r, JSON.parse(JSON.stringify(nodes))]);
//       setNodes(prevState);
//       setSelectedId(null);
//       return h.slice(0, -1);
//     });
//   }

//   function redo() {
//     setRedoStack((r) => {
//       if (r.length === 0) return r;
//       const nextState = r[r.length - 1];
//       setHistory((h) => [...h, JSON.parse(JSON.stringify(nodes))]);
//       setNodes(nextState);
//       setSelectedId(null);
//       return r.slice(0, -1);
//     });
//   }

//   useEffect(() => {
//     function handleKey(e: KeyboardEvent) {
//       const meta = e.metaKey || e.ctrlKey;
//       if (!meta || e.key.toLowerCase() !== "z") return;
//       e.preventDefault();
//       if (e.shiftKey) redo();
//       else undo();
//     }
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [nodes]);

//   function addNode(type: TransformType) {
//     pushHistory(nodes);
//     counter.current += 1;
//     const idx = nodes.length;
//     const node: PipelineNode = {
//       id: `n${counter.current}_${Date.now()}`,
//       type,
//       label: TRANSFORM_LABELS[type],
//       x: 40 + (idx % 4) * 220,
//       y: 30 + Math.floor(idx / 4) * 150,
//       config: defaultConfig(type, headers),
//     };
//     setNodes((prev) => [...prev, node]);
//     setSelectedId(node.id);
//   }

// function addSuggestedNodes(suggestions: { type: TransformType; config: Record<string, any> }[]) {
//     pushHistory(nodes);
//     setNodes((prev) => {
//       const startIdx = prev.length;
//       const added = suggestions.map((s, i) => {
//         counter.current += 1;
//         const idx = startIdx + i;
//         return {
//           id: `n${counter.current}_${Date.now()}_${i}`,
//           type: s.type,
//           label: TRANSFORM_LABELS[s.type],
//           x: 40 + (idx % 4) * 220,
//           y: 30 + Math.floor(idx / 4) * 150,
//           // merge over the default config so any field the model omitted still has a sane fallback
//           config: { ...defaultConfig(s.type, headers), ...s.config },
//         };
//       });
//       return [...prev, ...added];
//     });
//     toast(`Added ${suggestions.length} suggested step${suggestions.length !== 1 ? "s" : ""}`);
//   }

// function applyGeneratedPipeline(steps: { type: TransformType; config: Record<string, any> }[]) {
//     pushHistory(nodes);
//     setNodes((prev) => {
//       // Keep Source nodes as-is, replace everything downstream with the generated chain.
//       const sourceNodes = prev.filter((n) => n.type === "source");
//       const startIdx = sourceNodes.length;
//       const generated = steps.map((s, i) => {
//         counter.current += 1;
//         const idx = startIdx + i;
//         return {
//           id: `n${counter.current}_${Date.now()}_${i}`,
//           type: s.type,
//           label: TRANSFORM_LABELS[s.type],
//           x: 40 + (idx % 4) * 220,
//           y: 30 + Math.floor(idx / 4) * 150,
//           config: { ...defaultConfig(s.type, headers), ...s.config },
//         };
//       });
//       return [...sourceNodes, ...generated];
//     });
// setSelectedId(null);
//     toast(`Generated a ${steps.length}-step pipeline`);
//   }

//   function applyCopilotOperations(ops: CopilotOperation[]) {
//     pushHistory(nodes);
//     setNodes((prev) => {
//       let current = [...prev];
//       for (const op of ops) {
//         if (op.op === "add" && op.type) {
//           counter.current += 1;
//           const idx = current.length;
//           current.push({
//             id: `n${counter.current}_${Date.now()}`,
//             type: op.type,
//             label: TRANSFORM_LABELS[op.type],
//             x: 40 + (idx % 4) * 220,
//             y: 30 + Math.floor(idx / 4) * 150,
//             config: { ...defaultConfig(op.type, headers), ...op.config },
//           });
//         } else if (op.op === "remove" && op.nodeId) {
//           current = current.filter((n) => n.id !== op.nodeId);
//         } else if (op.op === "update" && op.nodeId) {
//           current = current.map((n) =>
//             n.id === op.nodeId ? { ...n, config: { ...n.config, ...op.config } } : n
//           );
//         }
//       }
//       return current;
//     });
//     toast(`Applied ${ops.length} change${ops.length !== 1 ? "s" : ""} from copilot`);
//   }

//   function updateNodeConfig(id: string, patch: Record<string, any>) {
//     setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, config: { ...n.config, ...patch } } : n)));
//   }

//  function removeNode(id: string) {
//     pushHistory(nodes);
//     setNodes((prev) => prev.filter((n) => n.id !== id));
//     if (selectedId === id) setSelectedId(null);
//   }

// function onNodeMouseDown(e: React.MouseEvent, node: PipelineNode) {
//     const nodeId = node.id;
//     const startX = e.clientX;
//     const startY = e.clientY;
//     const ox = node.x;
//     const oy = node.y;
//     dragState.current = { id: nodeId, startX, startY, ox, oy };

//     function onMove(ev: MouseEvent) {
//       const dx = ev.clientX - startX;
//       const dy = ev.clientY - startY;
//       setNodes((prev) =>
//         prev.map((n) =>
//           n.id === nodeId ? { ...n, x: Math.max(0, ox + dx), y: Math.max(0, oy + dy) } : n
//         )
//       );
//     }
//     function onUp() {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//       dragState.current = null;
//     }
//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//   }

//   function handleSourceUpload(nodeId: string, file: File) {
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => {
//         const parsedHeaders = res.meta.fields || [];
//         updateNodeConfig(nodeId, {
//           mode: "upload",
//           rows: res.data,
//           headers: parsedHeaders,
//           fileName: file.name,
//           connectionId: "",
//           connectionName: "",
//         });
//         setHeaders(parsedHeaders);
//         toast(`${file.name} loaded — ${(res.data as any[]).length} rows`);
//       },
//     });
//   }

//   async function handleSourceConnection(nodeId: string, connectionId: string) {
//     const conn = connections.find((c) => c._id === connectionId);
//     if (!conn) return;
//     toast("Fetching a sample from " + conn.name + "…");
//     const res = await fetch(`/api/connections/${connectionId}/test`, { method: "POST" });
//     const data = await res.json();
//     if (data.testResult?.ok) {
//       updateNodeConfig(nodeId, {
//         mode: "connection",
//         connectionId,
//         connectionName: conn.name,
//         rows: [], // resolved live at run time server-side
//         sampleRows: data.testResult.rows || [], // small sample, used for the data profile only
//         headers: data.testResult.headers,
//         fileName: "",
//       });
//       setHeaders(data.testResult.headers || []);
//       toast(`Connected — sample shows ${data.testResult.headers?.length || 0} columns`);
//     } else {
//       toast("Connection test failed: " + (data.testResult?.error || data.error));
//     }
//   }

//   function handleReferenceUpload(nodeId: string, file: File) {
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => {
//         updateNodeConfig(nodeId, {
//           referenceRows: res.data,
//           referenceHeaders: res.meta.fields || [],
//           referenceFileName: file.name,
//         });
//       },
//     });
//   }

//   async function savePipeline() {
//     const payload = { name, environment, headers, nodes,edges };
//     if (savedId) {
//       const res = await fetch(`/api/pipelines/${savedId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) toast("Pipeline saved");
//       return savedId;
//     } else {
//       const res = await fetch(`/api/pipelines`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setSavedId(data.pipeline._id);
//         toast("Pipeline created");
//         router.replace(`/dashboard/designer/${data.pipeline._id}`);
//         return data.pipeline._id;
//       }
//     }
//     return null;
//   }

//     const NEXT_ENV: Record<string, string> = { DEV: "SIT", SIT: "PROD" };

//   async function promotePipeline() {
//     if (!savedId) {
//       toast("Save the pipeline before promoting it");
//       return;
//     }
//     const target = NEXT_ENV[environment];
//     if (!target) {
//       toast("PROD is the top of the chain — nothing to promote to");
//       return;
//     }
//     setPromoting(true);
//     const res = await fetch(`/api/pipelines/${savedId}/promote`, { method: "POST" });
//     const data = await res.json();
//     setPromoting(false);
//     if (res.ok) {
//       toast(data.wasUpdate ? `Re-promoted to ${target} (updated existing copy)` : `Promoted to ${target}`);
//     } else {
//       toast("Promote failed: " + data.error);
//     }
//   }


//   async function runPipelineNow() {
//     const hasSource = nodes.some((n) => n.type === "source" && (n.config?.rows?.length || n.config?.connectionId));
//     if (!hasSource) {
//       toast("Add a Source node and attach a CSV or connection first");
//       return;
//     }
//     const idToUse = savedId || (await savePipeline());
//     if (!idToUse) return;
//     setRunning(true);
//     setLog([]);
//     const res = await fetch(`/api/pipelines/${idToUse}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
//     const data = await res.json();
//     setLog(data.steps || []);
//     setPreview({ rows: data.rows || [], headers: data.headers || headers });
//     setRunning(false);
//     toast(data.status === "success" ? "Pipeline finished" : "Pipeline finished with errors");
//   }

//   const selected = nodes.find((n) => n.id === selectedId) || null;

//   // return (
//   //   <div className="grid grid-cols-[210px_1fr_290px] h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm">
//   //     {/* PALETTE */}
//   //     <div className="border-r border-[#E3E7EF] bg-white p-3 overflow-y-auto">
//   //       <div className="mb-3">
//   //         <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Pipeline name</label>
//   //         <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
//   //       </div>
//   //       <div className="mb-4">
//   //         <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Environment</label>
//   //         <select className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
//   //           <option>DEV</option>
//   //           <option>SIT</option>
//   //           <option>PROD</option>
//   //         </select>
//   //       </div>

//   //       {TRANSFORM_GROUPS.map((g) => (
//   //         <div key={g.title}>
//   //           <h3 className="text-[10px] uppercase tracking-wide text-[#9AA1B2] mt-3 mb-1.5">{g.title}</h3>
//   //           {g.types.map((t) => (
//   //             <button
//   //               key={t}
//   //               onClick={() => addNode(t)}
//   //               className="w-full flex items-center gap-2 text-xs font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1.5 hover:border-[#2F6FED] hover:bg-[#2F6FED0d] text-left"
//   //             >
//   //               <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
//   //               {TRANSFORM_LABELS[t]}
//   //               <span className="ml-auto text-[#9AA1B2]">+</span>
//   //             </button>
//   //           ))}
//   //         </div>
//   //       ))}
//   //     </div>
//       return (
//     <div
//       className="grid h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm"
//       style={{ gridTemplateColumns: `${paletteCollapsed ? 52 : 210}px 1fr 290px` }}
//     >
//       {/* PALETTE */}
//       <div className="border-r border-[#E3E7EF] bg-white p-2 overflow-y-auto relative">
//         <button
//           onClick={() => setPaletteCollapsed((v) => !v)}
//           title={paletteCollapsed ? "Expand panel" : "Collapse panel — focus on the canvas"}
//           className="w-full flex items-center justify-center border border-[#E3E7EF] rounded-lg py-1.5 mb-2 text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] text-xs"
//         >
//           {paletteCollapsed ? "»" : "« Focus mode"}
//         </button>

//         {paletteCollapsed ? (
//           <div className="flex flex-col items-center gap-1.5">
//             {TRANSFORM_GROUPS.flatMap((g) => g.types).map((t) => (
//               <button
//                 key={t}
//                 onClick={() => addNode(t)}
//                 title={TRANSFORM_LABELS[t]}
//                 className="w-8 h-8 rounded-lg border border-[#E3E7EF] flex items-center justify-center hover:border-[#2F6FED]"
//               >
//                 <span className={`w-2.5 h-2.5 rounded-sm ${dotClassFor(t)}`} />
//               </button>
//             ))}
//           </div>
//         ) : (
//           <div className="px-1">
//         <div className="mb-3">
//           <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Pipeline name</label>
//           <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
//         </div>
//         <div className="mb-4">
//           <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Environment</label>
//           <select className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
//             <option>DEV</option>
//             <option>SIT</option>
//             <option>PROD</option>
//           </select>
//         </div>

//         {TRANSFORM_GROUPS.map((g) => (
//           <div key={g.title}>
//             <h3 className="text-[10px] uppercase tracking-wide text-[#9AA1B2] mt-3 mb-1.5">{g.title}</h3>
//             {g.types.map((t) => (
//               <button
//                 key={t}
//                 onClick={() => addNode(t)}
//                 className="w-full flex items-center gap-2 text-xs font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1.5 hover:border-[#2F6FED] hover:bg-[#2F6FED0d] text-left"
//               >
//                 <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
//                 {TRANSFORM_LABELS[t]}
//                 <span className="ml-auto text-[#9AA1B2]">+</span>
//               </button>
//             ))}
//           </div>
//         ))}
//           </div>
//         )}
//       </div>
//       {/* CANVAS */}
//       <div className="relative overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #E3E7EF 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
//         <div className="relative" style={{ width: 1400, height: 1000 }}>
//           {/* <svg className="absolute inset-0 w-full h-full pointer-events-none">
//             {nodes.slice(0, -1).map((a, i) => {
//               const b = nodes[i + 1];
//               const x1 = a.x + 190, y1 = a.y + 35, x2 = b.x, y2 = b.y + 35, mid = (x1 + x2) / 2;
//               return <path key={a.id} d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`} stroke="#2F6FED55" strokeWidth={2} fill="none" />;
//             })}
//           </svg> */}
//                 {/* SVG layer — wires + dragging wire */}
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 1 }}
//       >
//         <defs>
//           <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
//             <polygon points="0 0, 8 3, 0 6" fill="#2F6FED" opacity="0.7" />
//           </marker>
//         </defs>

//         {/* Existing edges */}
//         {edges.map((edge) => {
//           const fromNode = nodes.find((n) => n.id === edge.from);
//           const toNode = nodes.find((n) => n.id === edge.to);
//           if (!fromNode || !toNode) return null;
//           const x1 = fromNode.x + 210;
//           const y1 = fromNode.y + 36;
//           const x2 = toNode.x;
//           const y2 = toNode.y + 36;
//           const mx = (x1 + x2) / 2;
//           return (
//             <g key={edge.id} className="pointer-events-auto">
//               <path
//                 d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
//                 fill="none"
//                 stroke="transparent"
//                 strokeWidth={12}
//                 className="cursor-pointer"
//                 onClick={() => setEdges((prev) => prev.filter((e) => e.id !== edge.id))}
//               />
//               <path
//                 d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
//                 fill="none"
//                 stroke="#2F6FED"
//                 strokeWidth={1.5}
//                 opacity={0.6}
//                 markerEnd="url(#arrowhead)"
//               />
//             </g>
//           );
//         })}

//         {/* Wire being dragged */}
//         {draggingWire && (
//           <path
//             d={`M ${draggingWire.fromX} ${draggingWire.fromY} C ${(draggingWire.fromX + draggingWire.mouseX) / 2} ${draggingWire.fromY} ${(draggingWire.fromX + draggingWire.mouseX) / 2} ${draggingWire.mouseY} ${draggingWire.mouseX} ${draggingWire.mouseY}`}
//             fill="none"
//             stroke="#2F6FED"
//             strokeWidth={1.5}
//             strokeDasharray="6 3"
//             opacity={0.8}
//           />
//         )}
//       </svg>

//           {nodes.length === 0 && (
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#6B7385] w-80">
//               <h3 className="text-base font-semibold text-[#1A2233] mb-2">This pipeline is empty</h3>
//               <p className="text-xs leading-relaxed">
//                 Start with a <b>Source</b> node (CSV or a saved connection), then add transforms, then finish with a <b>Target</b>.
//               </p>
//             </div>
//           )}

//           {nodes.map((n, i) => (
//             <div
//               key={n.id}
//               onMouseDown={(e) => onNodeMouseDown(e, n)}
//               onClick={() => setSelectedId(n.id)}
//               className={`absolute w-[190px] bg-white border rounded-xl px-3.5 py-3 cursor-grab shadow-sm border-t-[3px] ${borderClassFor(n.type)} ${
//                 n.id === selectedId ? "border-[#2F6FED] ring-2 ring-[#2F6FED22]" : "border-[#E3E7EF]"
//               }`}
//               style={{ left: n.x, top: n.y }}
//             >
//               <div className="flex justify-between items-center text-[13px] font-semibold">
//                 <span>{n.label}</span>
//                 <StatusDot nodeId={n.id} log={log} />
//               </div>
//               <div className="text-[9.5px] font-mono text-[#9AA1B2] mt-0.5 uppercase tracking-wide">step {i + 1} · {n.type}</div>
//               {n.type === "source" && (
//                 <div className="text-[10.5px] font-mono text-[#2F6FED] mt-1.5 truncate">
//                   {n.config.connectionName || n.config.fileName || "not configured"}
//                 </div>
//               )}
//               <div className="text-[10.5px] font-mono text-[#9AA1B2] mt-1.5">
//                 <RowInfo nodeId={n.id} log={log} />
//               </div>
//               <button
//                 onClick={(e) => { e.stopPropagation(); removeNode(n.id); }}
//                 className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-white border border-[#E3E7EF] text-[10px] text-[#9AA1B2] hover:text-red-500 hover:border-red-400 flex items-center justify-center"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* INSPECTOR */}
//       <div className="border-l border-[#E3E7EF] bg-white p-4 overflow-y-auto">
//         {!selected ? (
//           <div className="text-[#6B7385] text-xs text-center mt-10">Select a node to configure it.</div>
//         ) : (
//  <NodeInspector
//             node={selected}
//             headers={headers}
//             connections={connections}
//             allNodes={nodes}
//             onChange={(patch) => updateNodeConfig(selected.id, patch)}
//             onReferenceUpload={(file) => handleReferenceUpload(selected.id, file)}
//             onSourceUpload={(file) => handleSourceUpload(selected.id, file)}
//             onSourceConnection={(connId) => handleSourceConnection(selected.id, connId)}
//             onOpenProfile={(nodeId) => setProfileModalNodeId(nodeId)}
//             onOpenAiSuggest={(nodeId) => setAiSuggestNodeId(nodeId)}
//           />
//         )}

//         <div className="mt-5 pt-4 border-t border-[#E3E7EF]">
//           <h3 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] mb-2">Execution log</h3>
//           {log.length === 0 ? (
//             <div className="text-[11px] text-[#9AA1B2]">No runs yet.</div>
//           ) : (
//             <div className="space-y-1.5">
//               {[...log].reverse().map((s, i) => (
//                 <div key={i} className={`text-[11px] font-mono bg-[#FAFBFD] rounded px-2 py-1.5 border-l-2 ${s.ok ? "border-emerald-500" : "border-red-500 text-red-600"}`}>
//                   <div className="font-semibold text-[#1A2233]">{s.label}</div>
//                   <div>{s.message}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* <div className="fixed top-3 right-6 flex gap-2 z-30">
//         <button onClick={savePipeline} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save pipeline</button>
//         <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
//           {running ? "Running…" : "▶ Run pipeline"}
//         </button>
//       </div> */}

//         <div className="fixed top-3 z-30 flex gap-1.5" style={{ left: (paletteCollapsed ? 52 : 210) + 16 }}>
//         <button
//           onClick={undo}
//           disabled={history.length === 0}
//           title="Undo (Ctrl+Z)"
//           className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] bg-white rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30 disabled:hover:border-[#E3E7EF] disabled:hover:text-[#6B7385]"
//         >
//           <Undo2 size={14} />
//         </button>
//         <button
//           onClick={redo}
//           disabled={redoStack.length === 0}
//           title="Redo (Ctrl+Shift+Z)"
//           className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] bg-white rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30 disabled:hover:border-[#E3E7EF] disabled:hover:text-[#6B7385]"
//         >
//           <Redo2 size={14} />
//         </button>
//       </div>

//       <div className="fixed top-3 right-6 flex gap-2 z-30">
//         {promotedFrom && (
//           <button
//             onClick={() => router.push(`/dashboard/pipelines/diff/${savedId}`)}
//             className="text-xs font-semibold border border-[#E3E7EF] text-[#6B7385] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]"
//           >
//             View diff vs source →
//           </button>
//         )}
//         <button
//           onClick={() => {
//             const hasSource = nodes.some((n) => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
//             if (!hasSource) { toast("Add a Source node with data first"); return; }
//             setShowGenerateModal(true);
//           }}
//           className="text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] bg-white rounded-lg px-3.5 py-2 hover:bg-[#7C6AE814] flex items-center gap-1.5"
//         >
//           ✨ Generate from prompt
//         </button>
//         <button
//           onClick={() => setShowCopilot((v) => !v)}
//           className={`text-xs font-semibold border rounded-lg px-3.5 py-2 flex items-center gap-1.5 transition-colors ${
//             showCopilot
//               ? "border-[#7C6AE8] bg-[#7C6AE8] text-white"
//               : "border-[#7C6AE8] text-[#7C6AE8] bg-white hover:bg-[#7C6AE814]"
//           }`}
//         >
//           💬 {showCopilot ? "Close copilot" : "Copilot"}
//         </button>
//         {environment !== "PROD" && (
//           <button onClick={promotePipeline} disabled={promoting} className="text-xs font-semibold border border-[#D98A1E] text-[#D98A1E] bg-white rounded-lg px-3.5 py-2 hover:bg-[#D98A1E14] disabled:opacity-50">
//             {promoting ? "Promoting…" : `Promote to ${environment === "DEV" ? "SIT" : "PROD"} →`}
//           </button>
//         )}
//         <button onClick={savePipeline} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save pipeline</button>
//         <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
//           {running ? "Running…" : "▶ Run pipeline"}
//         </button>
//       </div>

//       {preview && (
//         <div className="fixed bottom-0 right-[290px] bg-white border-t border-[#E3E7EF] max-h-64 overflow-hidden z-20" style={{ left: paletteCollapsed ? 52 : 210 }}>
//           <div className="flex justify-between items-center px-4 py-2 border-b border-[#E3E7EF]">
//             <h3 className="text-xs font-semibold">Output preview — {preview.rows.length} rows total, showing {Math.min(25, preview.rows.length)}</h3>
//             <div className="flex gap-2">
//               <button onClick={() => downloadOutput(preview, "csv", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ CSV</button>
//               <button onClick={() => downloadOutput(preview, "json", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ JSON</button>
//               <button onClick={() => setPreview(null)} className="text-xs border border-[#E3E7EF] rounded px-2 py-1">Close</button>
//             </div>
//           </div>
//           <div className="overflow-auto p-3" style={{ maxHeight: 200 }}>
// <table className="text-xs w-full">
//   <thead>
//     <tr>{preview.headers.map((h, hi) => <th key={`${h}_${hi}`} className="text-left px-2.5 py-1.5 text-[#2F6FED] font-mono font-medium whitespace-nowrap">{h}</th>)}</tr>
//   </thead>
//               <tbody>
//                 {preview.rows.slice(0, 25).map((r, i) => (
//                    <tr key={i}>{preview.headers.map((h, hi) => <td key={`${h}_${hi}`} className="px-2.5 py-1.5 text-[#6B7385] whitespace-nowrap border-t border-[#F0F2F6]">{String(r[h] ?? "")}</td>)}</tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

// {toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A2233] text-white text-xs px-4 py-2.5 rounded-lg z-50">{toastMsg}</div>}

// {profileModalNodeId && (() => {
//         const profileNode = nodes.find((n) => n.id === profileModalNodeId);
//         if (!profileNode) return null;
//         const isSample = profileNode.config.mode === "connection";
//         const profileRows = isSample ? profileNode.config.sampleRows || [] : profileNode.config.rows || [];
//         return (
//           <DataProfileModal
//             rows={profileRows}
//             headers={headers}
//             isSample={isSample}
//             onClose={() => setProfileModalNodeId(null)}
//           />
//         );
//       })()}
      
// {aiSuggestNodeId && (() => {
//         const srcNode = nodes.find((n) => n.id === aiSuggestNodeId);
//         if (!srcNode) return null;
//         const isSample = srcNode.config.mode === "connection";
//         const dataRows = isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || [];
//         return (
//           <AiSuggestModal
//             rows={dataRows}
//             headers={headers}
//             onAddNodes={addSuggestedNodes}
//             onClose={() => setAiSuggestNodeId(null)}
//           />
//         );
//       })()}

//       {showGenerateModal && (() => {
//         const srcNode = nodes.find((n) => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
//         const isSample = srcNode?.config.mode === "connection";
//         const dataRows = srcNode ? (isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || []) : [];
//         const hasExistingSteps = nodes.some((n) => n.type !== "source");
//         return (
//           <AiGeneratePipelineModal
//             rows={dataRows}
//             headers={headers}
//             hasExistingSteps={hasExistingSteps}
//             onApply={applyGeneratedPipeline}
//             onClose={() => setShowGenerateModal(false)}
//           />
//         );
//       })()}

//             {showCopilot && (
//         <CopilotChat
//           nodes={nodes}
//           headers={headers}
//           onApplyOperations={applyCopilotOperations}
//           onClose={() => setShowCopilot(false)}
//         />
//       )}
//     </div>
//   );
// }
// function downloadOutput(preview: { rows: Row[]; headers: string[] }, format: "csv" | "json", pipelineName: string) {
//   let content: string;
//   let mime: string;
//   let ext: string;

//   if (format === "json") {
//     content = JSON.stringify(preview.rows, null, 2);
//     mime = "application/json";
//     ext = "json";
//   } else {
//     const escape = (v: any) => {
//       const s = String(v ?? "");
//       return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
//     };
//     const lines = [preview.headers.join(",")];
//     for (const row of preview.rows) {
//       lines.push(preview.headers.map((h) => escape(row[h])).join(","));
//     }
//     content = lines.join("\n");
//     mime = "text/csv";
//     ext = "csv";
//   }

//   const blob = new Blob([content], { type: mime });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${pipelineName.replace(/\s+/g, "_")}_output.${ext}`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// function StatusDot({ nodeId, log }: { nodeId: string; log: RunLogStep[] }) {
//   const entry = log.find((l) => l.nodeId === nodeId);
//   if (!entry) return <span className="w-[7px] h-[7px] rounded-full bg-[#E3E7EF]" />;
//   return <span className={`w-[7px] h-[7px] rounded-full ${entry.ok ? "bg-emerald-500" : "bg-red-500"}`} />;
// }
// function RowInfo({ nodeId, log }: { nodeId: string; log: RunLogStep[] }) {
//   const entry = log.find((l) => l.nodeId === nodeId);
//   if (!entry) return <>not yet run</>;
//   return <>{entry.rowsOut} rows</>;
// }

// function NodeInspector({
//   node,
//   headers,
//   connections,
//   allNodes,
//   onChange,
//   onReferenceUpload,
//   onSourceUpload,
//   onSourceConnection,
//   onOpenProfile,
//   onOpenAiSuggest,
// }: {
//   node: PipelineNode;
//   headers: string[];
//   connections: any[];
//   allNodes: PipelineNode[];
//   onChange: (patch: Record<string, any>) => void;
//   onReferenceUpload: (file: File) => void;
//   onSourceUpload: (file: File) => void;
//   onSourceConnection: (connectionId: string) => void;
//   onOpenProfile: (nodeId: string) => void;
//   onOpenAiSuggest: (nodeId: string) => void;
// }) {

//   const cfg = node.config || {};
//   const selectCls = "w-full border border-[#E3E7EF] bg-[#FAFBFD] rounded px-2 py-1.5 text-xs";
//   const labelCls = "block text-[11px] font-mono text-[#6B7385] mb-1";

//   const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
//     <div className="mb-3"><label className={labelCls}>{label}</label>{children}</div>
//   );

//   const refUploader = (
//     <Field label={cfg.referenceFileName ? `Reference file: ${cfg.referenceFileName}` : "Reference CSV"}>
//       <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-2 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
//         {cfg.referenceFileName ? "Replace file" : "Upload reference CSV"}
//         <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReferenceUpload(f); }} />
//       </label>
//     </Field>
//   );

//   const refHeaders: string[] = cfg.referenceHeaders || [];

//   return (
//     <div>
//       <h3 className="text-sm font-semibold">{node.label}</h3>
//       <div className="text-[11px] font-mono text-[#9AA1B2] mb-3">step config</div>

//       {node.type === "source" && (
//         <>
//           <Field label="Source type">
//             <div className="flex gap-1.5 mb-2">
//               <button onClick={() => onChange({ mode: "upload" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "upload" || !cfg.mode ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>CSV upload</button>
//               <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Saved connection</button>
//             </div>
//           </Field>
//           {cfg.mode === "connection" ? (
//             <Field label="Connection">
//               <select className={selectCls} value={cfg.connectionId || ""} onChange={(e) => onSourceConnection(e.target.value)}>
//                 <option value="">Select a connection…</option>
//                 {connections.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}
//               </select>
//               {connections.length === 0 && <p className="text-[11px] text-[#6B7385] mt-1.5">No connections yet — add one on the Connections page.</p>}
//             </Field>
//  ) : (
//             <Field label={cfg.fileName ? `Loaded: ${cfg.fileName}` : "CSV file"}>
//               <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-3 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
//                 {cfg.fileName ? `✓ ${cfg.rows?.length || 0} rows — replace file` : "Upload CSV"}
//                 <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSourceUpload(f); }} />
//               </label>
//             </Field>
//           )}
// {((cfg.mode === "upload" && cfg.rows?.length) || (cfg.mode === "connection" && cfg.sampleRows?.length)) ? (
//             <>
//               <button onClick={() => onOpenProfile(node.id)} className="w-full text-xs font-semibold border border-[#E3E7EF] rounded-lg py-2 mt-1 hover:border-[#2F6FED] hover:text-[#2F6FED]">
//                 📊 View data profile
//               </button>
//               <button onClick={() => onOpenAiSuggest(node.id)} className="w-full text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] rounded-lg py-2 mt-2 hover:bg-[#7C6AE814]">
//                 ✨ Suggest transforms (AI)
//               </button>
//             </>
//           ) : null}
//         </>
//       )}

//       {node.type === "filter" && (
//         <>
//           <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Condition">
//             <select className={selectCls} value={cfg.op} onChange={(e) => onChange({ op: e.target.value })}>
//               <option value="not_empty">Is not empty</option>
//               <option value="empty">Is empty</option>
//               <option value="gt">Greater than</option>
//               <option value="lt">Less than</option>
//               <option value="eq">Equals</option>
//               <option value="neq">Not equals</option>
//               <option value="contains">Contains</option>
//             </select>
//           </Field>
//           {["gt", "lt", "eq", "neq", "contains"].includes(cfg.op) && (
//             <Field label="Value"><input className={selectCls} value={cfg.value || ""} onChange={(e) => onChange({ value: e.target.value })} /></Field>
//           )}
//         </>
//       )}

//       {node.type === "rename" && (
//         <>
//           <Field label="From column"><select className={selectCls} value={cfg.from} onChange={(e) => onChange({ from: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="To (new name)"><input className={selectCls} value={cfg.to || ""} onChange={(e) => onChange({ to: e.target.value })} placeholder="e.g. customer_name" /></Field>
//         </>
//       )}

//       {node.type === "nulls" && (
//         <>
//           <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Strategy">
//             <select className={selectCls} value={cfg.strategy} onChange={(e) => onChange({ strategy: e.target.value })}>
//               <option value="drop_row">Drop row</option>
//               <option value="fill_zero">Fill with 0</option>
//               <option value="fill_na">Fill with N/A</option>
//             </select>
//           </Field>
//         </>
//       )}

//     {node.type === "expression" && (
//         <>
//           {/* Tab bar */}
//           {(() => {
//             const tab = cfg._tab || "output";
//             const setTab = (t: string) => onChange({ _tab: t });

//             const outputPorts: { name: string; expr: string }[] =
//               cfg.outputPorts?.length ? cfg.outputPorts
//               : cfg.columns?.length ? cfg.columns
//               : cfg.name ? [{ name: cfg.name, expr: cfg.expr || "" }]
//               : [{ name: "", expr: "" }];

//             const variablePorts: { name: string; expr: string }[] = cfg.variablePorts || [];
//             const inputMacros: { name: string; value: string; description?: string }[] = cfg.inputMacros || [];
//             const outputMacros: { name: string; expr: string }[] = cfg.outputMacros || [];

//             const tabs = [
//               { key: "input", label: "Input ports", count: headers.length },
//               { key: "output", label: "Output ports", count: outputPorts.filter(p => p.name).length },
//               { key: "variable", label: "Variable ports", count: variablePorts.filter(p => p.name).length },
//               { key: "imacro", label: "Input macros", count: inputMacros.filter(p => p.name).length },
//               { key: "omacro", label: "Output macros", count: outputMacros.filter(p => p.name).length },
//             ];

//             return (
//               <div>
//                 {/* Tabs */}
//                 <div className="flex gap-1 flex-wrap mb-3">
//                   {tabs.map((t) => (
//                     <button
//                       key={t.key}
//                       onClick={() => setTab(t.key)}
//                       className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
//                         tab === t.key
//                           ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]"
//                           : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"
//                       }`}
//                     >
//                       {t.label}
//                       {t.count > 0 && (
//                         <span className="ml-1 text-[9px] bg-[#E3E7EF] text-[#6B7385] rounded-full px-1.5 py-0.5">{t.count}</span>
//                       )}
//                     </button>
//                   ))}
//                 </div>

//                 {/* INPUT PORTS — read-only reference */}
//                 {tab === "input" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Incoming columns from upstream — available as variables in all expressions.</p>
//                     <div className="space-y-1">
//                       {headers.length === 0 && <p className="text-[11px] text-[#9AA1B2]">No upstream columns yet — attach a Source first.</p>}
//                       {headers.map((h) => (
//                         <div key={h} className="flex items-center gap-2 bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-1.5">
//                           <span className="w-2 h-2 rounded-full bg-[#5B9CF6] flex-shrink-0" />
//                           <span className="text-[12px] font-mono text-[#1A2233]">{h}</span>
//                           <span className="ml-auto text-[10px] text-[#9AA1B2]">input</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* OUTPUT PORTS */}
//                 {tab === "output" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">New columns added to the output row. Use any input column name or variable port name as a variable.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {outputPorts.map((col, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#1FA971]" /> Output {i + 1}
//                             </span>
//                             {outputPorts.length > 1 && (
//                               <button onClick={() => {
//                                 const updated = outputPorts.filter((_, ci) => ci !== i);
//                                 onChange({ outputPorts: updated, name: undefined, expr: undefined, columns: undefined });
//                               }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                             )}
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={col.name} placeholder="Output column name" onChange={(e) => {
//                             const updated = outputPorts.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ outputPorts: updated, name: undefined, expr: undefined, columns: undefined });
//                           }} />
//                           <input className={`${selectCls} font-mono text-[11.5px]`} value={col.expr} placeholder="e.g. salary * 1.1" onChange={(e) => {
//                             const updated = outputPorts.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c);
//                             onChange({ outputPorts: updated, name: undefined, expr: undefined, columns: undefined });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ outputPorts: [...outputPorts, { name: "", expr: "" }], name: undefined, expr: undefined, columns: undefined })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]">
//                       + Add output port
//                     </button>
//                   </div>
//                 )}

//                 {/* VARIABLE PORTS */}
//                 {tab === "variable" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Intermediate computed values — usable in output port expressions but NOT added to the output row. Like local variables in IICS.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {variablePorts.length === 0 && (
//                         <p className="text-[11px] text-[#9AA1B2]">No variable ports yet.</p>
//                       )}
//                       {variablePorts.map((col, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#D98A1E]" /> Variable {i + 1}
//                             </span>
//                             <button onClick={() => {
//                               const updated = variablePorts.filter((_, ci) => ci !== i);
//                               onChange({ variablePorts: updated });
//                             }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={col.name} placeholder="Variable name (not in output)" onChange={(e) => {
//                             const updated = variablePorts.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ variablePorts: updated });
//                           }} />
//                           <input className={`${selectCls} font-mono text-[11.5px]`} value={col.expr} placeholder="e.g. salary * 12" onChange={(e) => {
//                             const updated = variablePorts.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c);
//                             onChange({ variablePorts: updated });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ variablePorts: [...variablePorts, { name: "", expr: "" }] })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#D98A1E] hover:text-[#D98A1E]">
//                       + Add variable port
//                     </button>
//                   </div>
//                 )}

//                 {/* INPUT MACROS */}
//                 {tab === "imacro" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Named constants or parameters — define a value once, reference it by name in any expression. Like $$parameter in IICS.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {inputMacros.length === 0 && (
//                         <p className="text-[11px] text-[#9AA1B2]">No input macros yet.</p>
//                       )}
//                       {inputMacros.map((m, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#7C6AE8]" /> Macro {i + 1}
//                             </span>
//                             <button onClick={() => {
//                               const updated = inputMacros.filter((_, ci) => ci !== i);
//                               onChange({ inputMacros: updated });
//                             }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={m.name} placeholder="Macro name (use in expressions)" onChange={(e) => {
//                             const updated = inputMacros.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ inputMacros: updated });
//                           }} />
//                           <input className={`${selectCls}`} value={m.value} placeholder="Value (e.g. 0.18 for tax rate)" onChange={(e) => {
//                             const updated = inputMacros.map((c, ci) => ci === i ? { ...c, value: e.target.value } : c);
//                             onChange({ inputMacros: updated });
//                           }} />
//                           <input className={`${selectCls} mt-1 text-[11px] text-[#9AA1B2]`} value={m.description || ""} placeholder="Description (optional)" onChange={(e) => {
//                             const updated = inputMacros.map((c, ci) => ci === i ? { ...c, description: e.target.value } : c);
//                             onChange({ inputMacros: updated });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ inputMacros: [...inputMacros, { name: "", value: "", description: "" }] })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#7C6AE8] hover:text-[#7C6AE8]">
//                       + Add input macro
//                     </button>
//                   </div>
//                 )}

//                 {/* OUTPUT MACROS */}
//                 {tab === "omacro" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Parameterized output columns — like output ports but intended for reusable, parameterized transformations. Added to output row.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {outputMacros.length === 0 && (
//                         <p className="text-[11px] text-[#9AA1B2]">No output macros yet.</p>
//                       )}
//                       {outputMacros.map((col, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#DA4B4B]" /> Output macro {i + 1}
//                             </span>
//                             <button onClick={() => {
//                               const updated = outputMacros.filter((_, ci) => ci !== i);
//                               onChange({ outputMacros: updated });
//                             }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={col.name} placeholder="Output column name" onChange={(e) => {
//                             const updated = outputMacros.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ outputMacros: updated });
//                           }} />
//                           <input className={`${selectCls} font-mono text-[11.5px]`} value={col.expr} placeholder="e.g. salary * TAX_RATE" onChange={(e) => {
//                             const updated = outputMacros.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c);
//                             onChange({ outputMacros: updated });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ outputMacros: [...outputMacros, { name: "", expr: "" }] })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#DA4B4B] hover:text-[#DA4B4B]">
//                       + Add output macro
//                     </button>
//                   </div>
//                 )}

//                 <div className="mt-3 pt-2.5 border-t border-[#E3E7EF] text-[11px] text-[#9AA1B2] leading-relaxed">
//                   <strong className="text-[#6B7385]">Execution order:</strong> Input macros → Variable ports → Output ports → Output macros.
//                   Variables can reference input columns and macros. Output ports can reference variables, input columns, and macros.
//                 </div>
//               </div>
//             );
//           })()}
//         </>
//       )}

//       {node.type === "sequence" && (
//         <>
//           <Field label="Output column name"><input className={selectCls} value={cfg.outputColumn || ""} onChange={(e) => onChange({ outputColumn: e.target.value })} placeholder="e.g. surrogate_key" /></Field>
//           <Field label="Start at"><input type="number" className={selectCls} value={cfg.startAt ?? 1} onChange={(e) => onChange({ startAt: Number(e.target.value) })} /></Field>
//           <Field label="Step"><input type="number" className={selectCls} value={cfg.step ?? 1} onChange={(e) => onChange({ step: Number(e.target.value) })} /></Field>
//           <p className="text-[11px] text-[#6B7385] leading-relaxed">Adds an auto-incrementing column — useful for generating surrogate keys before loading into a Target.</p>
//         </>
//       )}


//       {node.type === "sorter" && (
//         <>
//           <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={(e) => onChange({ direction: e.target.value })}><option value="asc">Ascending</option><option value="desc">Descending</option></select></Field>
//         </>
//       )}

//       {node.type === "rank" && (
//         <>
//           <Field label="Rank by column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Output column name"><input className={selectCls} value={cfg.outputColumn || ""} onChange={(e) => onChange({ outputColumn: e.target.value })} /></Field>
//           <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={(e) => onChange({ direction: e.target.value })}><option value="desc">Highest = rank 1</option><option value="asc">Lowest = rank 1</option></select></Field>
//         </>
//       )}

//       {node.type === "aggregator" && (
//         <>
//           <Field label="Group by column"><select className={selectCls} value={cfg.groupBy} onChange={(e) => onChange({ groupBy: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Target column"><select className={selectCls} value={cfg.targetColumn} onChange={(e) => onChange({ targetColumn: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Function"><select className={selectCls} value={cfg.fn} onChange={(e) => onChange({ fn: e.target.value })}><option value="sum">Sum</option><option value="avg">Average</option><option value="count">Count</option><option value="min">Min</option><option value="max">Max</option></select></Field>
//         </>
//       )}

//       {node.type === "router" && (
//         <>
//           <Field label="Column to route on"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <p className="text-[11px] text-[#6B7385] leading-relaxed">Rows get tagged with a <code>route</code> column based on rules below.</p>
//           {(cfg.routes || []).map((rt: any, i: number) => (
//             <div key={i} className="flex gap-1.5 mt-2">
//               <input className="w-1/2 border border-[#E3E7EF] rounded px-2 py-1 text-xs" placeholder="route name" value={rt.name} onChange={(e) => { const routes = [...cfg.routes]; routes[i] = { ...routes[i], name: e.target.value }; onChange({ routes }); }} />
//               <input className="w-1/2 border border-[#E3E7EF] rounded px-2 py-1 text-xs" placeholder="matches value" value={rt.value} onChange={(e) => { const routes = [...cfg.routes]; routes[i] = { ...routes[i], value: e.target.value }; onChange({ routes }); }} />
//             </div>
//           ))}
//           <button className="text-xs text-[#2F6FED] mt-2" onClick={() => onChange({ routes: [...(cfg.routes || []), { name: "", value: "" }] })}>+ Add route</button>
//         </>
//       )}

//       {node.type === "union" && <>{refUploader}</>}

//       {node.type === "joiner" && (
//         <>
//           {refUploader}
//           <Field label="Left key (this pipeline)"><select className={selectCls} value={cfg.leftKey} onChange={(e) => onChange({ leftKey: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Right key (reference CSV)"><select className={selectCls} value={cfg.rightKey} onChange={(e) => onChange({ rightKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Join type"><select className={selectCls} value={cfg.joinType} onChange={(e) => onChange({ joinType: e.target.value })}><option value="inner">Inner join</option><option value="left">Left join</option></select></Field>
//         </>
//       )}

//       {node.type === "lookup" && (
//         <>
//           {refUploader}
//           <Field label="Key in this pipeline"><select className={selectCls} value={cfg.key} onChange={(e) => onChange({ key: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Key in reference CSV"><select className={selectCls} value={cfg.lookupKey} onChange={(e) => onChange({ lookupKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <p className="text-[11px] text-[#6B7385] mt-1">Columns to copy from the reference row (comma separated):</p>
//           <input className={selectCls + " mt-1"} placeholder="e.g. price, category" value={(cfg.copyColumns || []).join(", ")} onChange={(e) => onChange({ copyColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
//         </>
//       )}

//       {node.type === "updateStrategy" && (
//         <>
//           {refUploader}
//           <Field label="Key column (identifies a record)"><select className={selectCls} value={cfg.key} onChange={(e) => onChange({ key: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <p className="text-[11px] text-[#6B7385] leading-relaxed">Compares each row against the reference snapshot and tags it INSERT / UPDATE / NOCHANGE / DELETE.</p>
//         </>
//       )}

//             {/* {(node.type === "scd1" || node.type === "scd2" || node.type === "scd3") && (
//         <>
//           <div className="text-[11px] text-[#6B7385] bg-[#F4F6FA] rounded-lg px-3 py-2 mb-3 leading-relaxed">
//             {node.type === "scd1" && "Type 1 — Overwrite. When a key match is found and tracked columns changed, the row is updated in place. Previous values are lost. Tags: INSERT | UPDATE | NOCHANGE."}
//             {node.type === "scd2" && "Type 2 — Full history. Changed rows spawn a new current row + an expired old row with start/end dates. Tags: INSERT | UPDATE | EXPIRE | NOCHANGE."}
//             {node.type === "scd3" && "Type 3 — Previous value columns. Adds _prev_<column> for each tracked column so you can see what changed. One level of history only. Tags: INSERT | UPDATE | NOCHANGE."}
//           </div>

//           <Field label="Business key column">
//             <select className={selectCls} value={cfg.keyColumn || ""} onChange={(e) => onChange({ keyColumn: e.target.value })}>
//               <option value="">Select key column…</option>
//               {headers.map((h) => <option key={h} value={h}>{h}</option>)}
//             </select>
//           </Field>

//           {node.type === "scd2" && (
//             <Field label="Surrogate key column name">
//               <input className={selectCls} value={cfg.surrogateColumn || "surrogate_key"} onChange={(e) => onChange({ surrogateColumn: e.target.value })} placeholder="surrogate_key" />
//             </Field>
//           )}

//           <Field label="Tracked columns (compare for changes)">
//             <div className="space-y-1.5">
//               {headers.filter((h) => h !== cfg.keyColumn).map((h) => {
//                 const checked = (cfg.compareColumns || []).includes(h);
//                 return (
//                   <label key={h} className="flex items-center gap-2 text-[12px] cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={() => {
//                         const current: string[] = cfg.compareColumns || [];
//                         onChange({ compareColumns: checked ? current.filter((c: string) => c !== h) : [...current, h] });
//                       }}
//                     />
//                     <span className="font-mono">{h}</span>
//                   </label>
//                 );
//               })}
//               {headers.length === 0 && <p className="text-[11px] text-[#9AA1B2]">Attach a Source first to see columns.</p>}
//             </div>
//           </Field>

//           <Field label="Snapshot / reference data">
//             <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-3 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
//               {cfg.referenceHeaders?.length
//                 ? `✓ ${cfg.referenceRows?.length || 0} snapshot rows loaded`
//                 : "Upload snapshot CSV (previous state)"}
//               <input type="file" accept=".csv" className="hidden" onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 import("papaparse").then(({ default: Papa }) => {
//                   Papa.parse(file, {
//                     header: true,
//                     skipEmptyLines: true,
//                     complete: (result) => {
//                       onChange({
//                         referenceRows: result.data,
//                         referenceHeaders: result.meta.fields || [],
//                       });
//                     },
//                   });
//                 });
//               }} />
//             </label>
//             {cfg.referenceHeaders?.length > 0 && (
//               <p className="text-[11px] text-[#9AA1B2] mt-1">
//                 Columns: {cfg.referenceHeaders.slice(0, 5).join(", ")}{cfg.referenceHeaders.length > 5 ? ` +${cfg.referenceHeaders.length - 5} more` : ""}
//               </p>
//             )}
//           </Field>

//           <div className="mt-3 pt-3 border-t border-[#E3E7EF] text-[11px] text-[#9AA1B2] leading-relaxed">
//             <strong className="text-[#6B7385]">Output columns added:</strong>
//             {node.type === "scd1" && " _scd_action"}
//             {node.type === "scd2" && " surrogate_key, _scd_start_date, _scd_end_date, _scd_is_current, _scd_action"}
//             {node.type === "scd3" && ` _prev_<column> for each tracked column, _scd_action, _scd_change_date`}
//           </div>
//         </>
//       )} */}
//             {(node.type === "scd1" || node.type === "scd2" || node.type === "scd3") && (
//         <>
//           <div className="text-[11px] text-[#6B7385] bg-[#F4F6FA] rounded-lg px-3 py-2 mb-3 leading-relaxed">
//             {node.type === "scd1" && "Type 1 — Overwrite. Changed columns are updated in place. Previous values are lost. Adds: _scd_action"}
//             {node.type === "scd2" && "Type 2 — Full history. Changed rows spawn a new current row + an expired old row with dates. Adds: surrogate_key, _scd_start_date, _scd_end_date, _scd_is_current, _scd_action"}
//             {node.type === "scd3" && "Type 3 — Previous value columns. Adds _prev_<column> for each tracked column. One level of history. Adds: _prev_*, _scd_action, _scd_change_date"}
//           </div>

//           {/* Snapshot source — picks from any existing Source node in the pipeline */}
//           <Field label="Snapshot source (previous state)">
//             <select
//               className={selectCls}
//               value={cfg.snapshotNodeId || ""}
//               onChange={(e) => {
//                 const selectedNode = allNodes.find((n) => n.id === e.target.value);
//                 onChange({
//                   snapshotNodeId: e.target.value,
//                   snapshotRows: selectedNode?.config?.rows || [],
//                   snapshotHeaders: selectedNode?.config?.headers || [],
//                 });
//               }}
//             >
//               <option value="">Select a Source node as snapshot…</option>
//               {allNodes
//                 .filter((n) => n.type === "source" && n.id !== node.id && (n.config?.rows?.length || n.config?.connectionId))
//                 .map((n) => (
//                   <option key={n.id} value={n.id}>
//                     {n.config?.fileName || n.config?.connectionName || n.id} ({(n.config?.rows?.length || 0)} rows)
//                   </option>
//                 ))}
//             </select>
//             <p className="text-[11px] text-[#9AA1B2] mt-1">
//               Add a second Source node with the previous snapshot data, then select it here.
//               Works with any table — CSV, Postgres, MySQL, Sheets.
//             </p>
//           </Field>

//           {cfg.snapshotRows?.length > 0 && (
//             <div className="text-[11px] text-emerald-600 bg-emerald-50 rounded px-2.5 py-1.5 mb-2">
//               ✓ {cfg.snapshotRows.length} snapshot rows loaded from selected source
//             </div>
//           )}

//           <Field label="Business key column">
//             <select className={selectCls} value={cfg.keyColumn || ""} onChange={(e) => onChange({ keyColumn: e.target.value })}>
//               <option value="">Select key column…</option>
//               {headers.map((h) => <option key={h} value={h}>{h}</option>)}
//             </select>
//           </Field>

//           {node.type === "scd2" && (
//             <Field label="Surrogate key column name">
//               <input
//                 className={selectCls}
//                 value={cfg.surrogateColumn || "surrogate_key"}
//                 onChange={(e) => onChange({ surrogateColumn: e.target.value })}
//                 placeholder="surrogate_key"
//               />
//             </Field>
//           )}

//           <Field label="Tracked columns (compare for changes)">
//             <div className="space-y-1.5 max-h-48 overflow-y-auto">
//               {headers.filter((h) => h !== cfg.keyColumn).map((h) => {
//                 const checked = (cfg.compareColumns || []).includes(h);
//                 return (
//                   <label key={h} className="flex items-center gap-2 text-[12px] cursor-pointer hover:text-[#1A2233]">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={() => {
//                         const current: string[] = cfg.compareColumns || [];
//                         onChange({
//                           compareColumns: checked
//                             ? current.filter((c: string) => c !== h)
//                             : [...current, h],
//                         });
//                       }}
//                     />
//                     <span className="font-mono">{h}</span>
//                   </label>
//                 );
//               })}
//               {headers.length === 0 && (
//                 <p className="text-[11px] text-[#9AA1B2]">Attach a Source node first to see available columns.</p>
//               )}
//             </div>
//             {(cfg.compareColumns || []).length > 0 && (
//               <p className="text-[11px] text-[#9AA1B2] mt-1">
//                 Tracking: {(cfg.compareColumns as string[]).join(", ")}
//               </p>
//             )}
//           </Field>

//           <div className="mt-2 pt-2.5 border-t border-[#E3E7EF] text-[11px] text-[#9AA1B2] leading-relaxed">
//             <strong className="text-[#6B7385]">How to use:</strong> Add two Source nodes —
//             one for current data, one for the snapshot. Wire both into this node by selecting
//             the snapshot above. The current data flows through automatically.
//             {node.type === "scd2" && " Filter to _scd_action ≠ NOCHANGE downstream to see only changed rows."}
//           </div>
//         </>
//       )}

//       {node.type === "normalizer" && (
//         <>
//           <p className="text-[11px] text-[#6B7385] mb-2">Unpivot: turn repeating columns into rows.</p>
//           <Field label="Columns to unpivot (comma separated)"><input className={selectCls} placeholder="e.g. jan_sales, feb_sales, mar_sales" value={(cfg.pivotColumns || []).join(", ")} onChange={(e) => onChange({ pivotColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
//           <Field label="Columns to keep (comma separated)"><input className={selectCls} placeholder="e.g. customer_id, region" value={(cfg.keepColumns || []).join(", ")} onChange={(e) => onChange({ keepColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
//           <Field label="Name column"><input className={selectCls} value={cfg.nameColumn || ""} onChange={(e) => onChange({ nameColumn: e.target.value })} /></Field>
//           <Field label="Value column"><input className={selectCls} value={cfg.valueColumn || ""} onChange={(e) => onChange({ valueColumn: e.target.value })} /></Field>
//         </>
//       )}

//   {node.type === "target" && (
//         <>
//           <Field label="Destination">
//             <div className="flex gap-1.5 mb-2">
//               <button onClick={() => onChange({ mode: "preview" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode !== "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Preview only</button>
//               <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Write to DB</button>
//             </div>
//           </Field>
//           {cfg.mode === "connection" ? (
//             <>
//               <Field label="Connection (Postgres / MySQL only)">
//                 <select
//                   className={selectCls}
//                   value={cfg.connectionId || ""}
//                   onChange={(e) => {
//                     const c = connections.find((x) => x._id === e.target.value);
//                     onChange({ connectionId: e.target.value, connectionName: c?.name || "" });
//                   }}
//                 >
//                   <option value="">Select a connection…</option>
//                   {connections.filter((c) => c.type === "postgres" || c.type === "mysql").map((c) => (
//                     <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
//                   ))}
//                 </select>
//                 {connections.filter((c) => c.type === "postgres" || c.type === "mysql").length === 0 && (
//                   <p className="text-[11px] text-[#6B7385] mt-1.5">No Postgres/MySQL connections yet — add one on the Connections page.</p>
//                 )}
//               </Field>
//               <Field label="Target table">
//                 <input className={selectCls} value={cfg.table || ""} onChange={(e) => onChange({ table: e.target.value })} placeholder="e.g. customers_clean" />
//               </Field>
//               <Field label="Write mode">
//                 <select className={selectCls} value={cfg.writeMode || "insert"} onChange={(e) => onChange({ writeMode: e.target.value })}>
//                   <option value="insert">Insert (append rows)</option>
//                   <option value="truncate_insert">Truncate table, then insert</option>
//                 </select>
//               </Field>
//               <p className="text-[11px] text-[#6B7385] leading-relaxed">The table must already exist with matching column names — this writes rows into it, it doesn't create the table.</p>
//             </>
//           ) : (
//             <p className="text-[11px] text-[#6B7385]">Run the pipeline to preview output, or export it as CSV/JSON from the preview panel. No database write happens in this mode.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// }



/*------change the dashboard need to add dark mode */
// "use client";


// /* needs to add a proper framing in it*/

// import { useEffect, useRef, useState } from "react";
// import Papa from "papaparse";
// import { useRouter } from "next/navigation";
// import { Undo2, Redo2 } from "lucide-react";
// import type { PipelineNode, RunLogStep } from "@/lib/transforms";

// import DataProfileModal from "@/components/DataProfileModal";
// import AiSuggestModal from "@/components/AiSuggestModal";
// import AiGeneratePipelineModal from "@/components/AiGeneratePipelineModal";
// import CopilotChat, { CopilotOperation } from "@/components/CopilotChat";
// import { TRANSFORM_LABELS, TransformType } from "@/lib/transforms";
// import { Edge, autoWire } from "@/lib/graphUtils";

// type Row = Record<string, any>;



// const TRANSFORM_GROUPS: { title: string; types: TransformType[] }[] = [
//   { title: "Source", types: ["source"] },
//   { title: "Row & Column Ops", types: ["filter", "rename", "dedupe", "nulls", "expression"] },
//    { title: "Generate", types: ["sequence"] },
//   { title: "Sort & Aggregate", types: ["sorter", "rank", "aggregator"] },
//   { title: "Multi-source", types: ["router", "union", "joiner", "lookup", "updateStrategy"] },
//   { title: "Restructure", types: ["normalizer"] },
//   { title: "Target", types: ["target"] },
//   {
//     title: "SCD",
//     types: ["scd1", "scd2", "scd3"] as TransformType[],
//   },
// ];

// function colorFor(type: TransformType) {
//   if (type === "source") return "blue";
//   if (type === "target") return "green";
//   if (["router", "union", "joiner", "lookup", "updateStrategy"].includes(type)) return "amber";
//   return "violet";
// }
// function borderClassFor(type: TransformType) {
//   const c = colorFor(type);
//   return c === "blue" ? "border-t-blue-500" : c === "green" ? "border-t-emerald-500" : c === "amber" ? "border-t-amber-500" : "border-t-violet-500";
// }
// function dotClassFor(type: TransformType) {
  
//   const c = colorFor(type);
  
//   return c === "blue" ? "bg-blue-500" : c === "green" ? "bg-emerald-500" : c === "amber" ? "bg-amber-500" : "bg-violet-500";
  
// }

// function defaultConfig(type: TransformType, headers: string[]): Record<string, any> {
//   switch (type) {
//     case "source":
//       return { mode: "upload", fileName: "", rows: [], headers: [], connectionId: "", connectionName: "" };
//     case "filter":
//       return { column: headers[0] || "", op: "not_empty", value: "" };
//     case "rename":
//       return { from: headers[0] || "", to: "" };
//     case "nulls":
//       return { column: headers[0] || "", strategy: "drop_row" };
//     case "expression":
//       return {
//         outputPorts: [{ name: "", expr: "" }],
//         variablePorts: [],
//         inputMacros: [],
//         outputMacros: [],
//         _tab: "output",
//       };
//     case "sequence":
//       return { outputColumn: "seq_id", startAt: 1, step: 1 };
//     case "sorter":
//       return { column: headers[0] || "", direction: "asc" };
//     case "rank":
//       return { column: headers[0] || "", outputColumn: "rank", direction: "desc" };
//     case "aggregator":
//       return { groupBy: headers[0] || "", targetColumn: headers[0] || "", fn: "sum" };
//     case "router":
//       return { column: headers[0] || "", routes: [] };
//     case "union":
//       return { referenceRows: [], referenceFileName: "" };
//     case "joiner":
//       return { referenceRows: [], leftKey: headers[0] || "", rightKey: "", joinType: "inner", referenceFileName: "" };
//     case "lookup":
//       return { referenceRows: [], key: headers[0] || "", lookupKey: "", copyColumns: [], referenceFileName: "" };
//     case "updateStrategy":
//       return { referenceRows: [], key: headers[0] || "", referenceFileName: "" };
//     case "normalizer":
//       return { pivotColumns: [], nameColumn: "field", valueColumn: "value", keepColumns: [] };
//     case "target":
//       return { mode: "preview", connectionId: "", connectionName: "", table: "", writeMode: "insert" };
//     case "scd1":
//       return { keyColumn: "", compareColumns: [], snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
//     case "scd2":
//       return { keyColumn: "", compareColumns: [], surrogateColumn: "surrogate_key", snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
//     case "scd3":
//       return { keyColumn: "", compareColumns: [], snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
//     default:
//       return {};
//   }
// }

// export default function DesignerCanvas({
//   pipelineId,
//   initialPipeline,
// }: {
//   pipelineId: string;
//   initialPipeline?: any;
// }) {
//   const router = useRouter();
//   const [name, setName] = useState(initialPipeline?.name || "Untitled pipeline");
//   const [environment, setEnvironment] = useState(initialPipeline?.environment || "DEV");
//   const [headers, setHeaders] = useState<string[]>(initialPipeline?.headers || []);
//   const [nodes, setNodes] = useState<PipelineNode[]>(initialPipeline?.nodes || []);
//   const [edges, setEdges] = useState<Edge[]>(
//     initialPipeline?.edges?.length
//       ? initialPipeline.edges
//       : autoWire(initialPipeline?.nodes || [])
//   );
//   const [history, setHistory] = useState<PipelineNode[][]>([]);
//   const [redoStack, setRedoStack] = useState<PipelineNode[][]>([]);
//   const [promotedFrom] = useState<string | null>(initialPipeline?.promotedFrom || null);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [log, setLog] = useState<RunLogStep[]>([]);
//   const [running, setRunning] = useState(false);
//     const [draggingWire, setDraggingWire] = useState<{
//     fromNodeId: string;
//     fromX: number;
//     fromY: number;
//     mouseX: number;
//     mouseY: number;
//   } | null>(null);
//   const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; side: "in" | "out" } | null>(null);
//   const [preview, setPreview] = useState<{ rows: Row[]; headers: string[] } | null>(null);
//   const [savedId, setSavedId] = useState<string | null>(pipelineId !== "new" ? pipelineId : null);
//   const [toastMsg, setToastMsg] = useState("");
//   const [connections, setConnections] = useState<any[]>([]);
//   const [paletteCollapsed, setPaletteCollapsed] = useState(false);
//   const [promoting, setPromoting] = useState(false);
//   const [profileModalNodeId, setProfileModalNodeId] = useState<string | null>(null);
//   const [aiSuggestNodeId, setAiSuggestNodeId] = useState<string | null>(null);
//   const [showGenerateModal, setShowGenerateModal] = useState(false);
//   const [showCopilot, setShowCopilot] = useState(false);
//   const counter = useRef(0);
//   const dragState = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);
//   const canvasRef = useRef<HTMLDivElement>(null);

  
//   useEffect(() => {
//     fetch("/api/connections")
//       .then((r) => r.json())
//       .then((d) => setConnections(d.connections || []))
//       .catch(() => {});
//   }, []);

//   function toast(msg: string) {
//     setToastMsg(msg);
//     setTimeout(() => setToastMsg(""), 2600);
//   }


//   // Undo/redo tracks structural changes (add/remove/generate) — not every drag
//   // pixel or config keystroke, which would make the stack noisy and useless.
//   // Call pushHistory(nodes) with the PRE-mutation state right before any
//   // structural change.
//   function pushHistory(preChangeNodes: PipelineNode[]) {
//     setHistory((prev) => [...prev.slice(-49), JSON.parse(JSON.stringify(preChangeNodes))]);
//     setRedoStack([]);
//   }

//   function undo() {
//     setHistory((h) => {
//       if (h.length === 0) return h;
//       const prevState = h[h.length - 1];
//       setRedoStack((r) => [...r, JSON.parse(JSON.stringify(nodes))]);
//       setNodes(prevState);
//       setSelectedId(null);
//       return h.slice(0, -1);
//     });
//   }

//   function redo() {
//     setRedoStack((r) => {
//       if (r.length === 0) return r;
//       const nextState = r[r.length - 1];
//       setHistory((h) => [...h, JSON.parse(JSON.stringify(nodes))]);
//       setNodes(nextState);
//       setSelectedId(null);
//       return r.slice(0, -1);
//     });
//   }

//   useEffect(() => {
//     function handleKey(e: KeyboardEvent) {
//       const meta = e.metaKey || e.ctrlKey;
//       if (!meta || e.key.toLowerCase() !== "z") return;
//       e.preventDefault();
//       if (e.shiftKey) redo();
//       else undo();
//     }
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [nodes]);

//   useEffect(() => {
//     if (!draggingWire) return;

//     function onMove(e: MouseEvent) {
//       const el = canvasRef.current;
//       if (!el) return;
//       const rect = el.getBoundingClientRect();
//       const x = e.clientX - rect.left + el.scrollLeft;
//       const y = e.clientY - rect.top + el.scrollTop;
//       setDraggingWire((w) => (w ? { ...w, mouseX: x, mouseY: y } : w));
//     }

//     function onUp() {
//       setDraggingWire((w) => {
//         if (w && hoveredPort && hoveredPort.side === "in" && hoveredPort.nodeId !== w.fromNodeId) {
//           setEdges((prev) => {
//             const exists = prev.some((ed) => ed.from === w.fromNodeId && ed.to === hoveredPort.nodeId);
//             return exists ? prev : [...prev, { id: `e${Date.now()}`, from: w.fromNodeId, to: hoveredPort.nodeId }];
//           });
//         }
//         return null;
//       });
//       setHoveredPort(null);
//     }

//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//     return () => {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//     };
//   }, [draggingWire, hoveredPort]);

//   function addNode(type: TransformType) {
//     pushHistory(nodes);
//     counter.current += 1;
//     const idx = nodes.length;
//     const node: PipelineNode = {
//       id: `n${counter.current}_${Date.now()}`,
//       type,
//       label: TRANSFORM_LABELS[type],
//       x: 40 + (idx % 4) * 220,
//       y: 30 + Math.floor(idx / 4) * 150,
//       config: defaultConfig(type, headers),
//     };
//     setNodes((prev) => [...prev, node]);
//     setSelectedId(node.id);
//   }

// function addSuggestedNodes(suggestions: { type: TransformType; config: Record<string, any> }[]) {
//     pushHistory(nodes);
//     setNodes((prev) => {
//       const startIdx = prev.length;
//       const added = suggestions.map((s, i) => {
//         counter.current += 1;
//         const idx = startIdx + i;
//         return {
//           id: `n${counter.current}_${Date.now()}_${i}`,
//           type: s.type,
//           label: TRANSFORM_LABELS[s.type],
//           x: 40 + (idx % 4) * 220,
//           y: 30 + Math.floor(idx / 4) * 150,
//           // merge over the default config so any field the model omitted still has a sane fallback
//           config: { ...defaultConfig(s.type, headers), ...s.config },
//         };
//       });
//       return [...prev, ...added];
//     });
//     toast(`Added ${suggestions.length} suggested step${suggestions.length !== 1 ? "s" : ""}`);
//   }

// function applyGeneratedPipeline(steps: { type: TransformType; config: Record<string, any> }[]) {
//     pushHistory(nodes);
//     setNodes((prev) => {
//       // Keep Source nodes as-is, replace everything downstream with the generated chain.
//       const sourceNodes = prev.filter((n) => n.type === "source");
//       const startIdx = sourceNodes.length;
//       const generated = steps.map((s, i) => {
//         counter.current += 1;
//         const idx = startIdx + i;
//         return {
//           id: `n${counter.current}_${Date.now()}_${i}`,
//           type: s.type,
//           label: TRANSFORM_LABELS[s.type],
//           x: 40 + (idx % 4) * 220,
//           y: 30 + Math.floor(idx / 4) * 150,
//           config: { ...defaultConfig(s.type, headers), ...s.config },
//         };
//       });
//       return [...sourceNodes, ...generated];
//     });
// setSelectedId(null);
//     toast(`Generated a ${steps.length}-step pipeline`);
//   }

//   function applyCopilotOperations(ops: CopilotOperation[]) {
//     pushHistory(nodes);
//     setNodes((prev) => {
//       let current = [...prev];
//       for (const op of ops) {
//         if (op.op === "add" && op.type) {
//           counter.current += 1;
//           const idx = current.length;
//           current.push({
//             id: `n${counter.current}_${Date.now()}`,
//             type: op.type,
//             label: TRANSFORM_LABELS[op.type],
//             x: 40 + (idx % 4) * 220,
//             y: 30 + Math.floor(idx / 4) * 150,
//             config: { ...defaultConfig(op.type, headers), ...op.config },
//           });
//         } else if (op.op === "remove" && op.nodeId) {
//           current = current.filter((n) => n.id !== op.nodeId);
//         } else if (op.op === "update" && op.nodeId) {
//           current = current.map((n) =>
//             n.id === op.nodeId ? { ...n, config: { ...n.config, ...op.config } } : n
//           );
//         }
//       }
//       return current;
//     });
//     toast(`Applied ${ops.length} change${ops.length !== 1 ? "s" : ""} from copilot`);
//   }

//   function updateNodeConfig(id: string, patch: Record<string, any>) {
//     setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, config: { ...n.config, ...patch } } : n)));
//   }

//  function removeNode(id: string) {
//     pushHistory(nodes);
//     setNodes((prev) => prev.filter((n) => n.id !== id));
//     if (selectedId === id) setSelectedId(null);
//   }

// function onNodeMouseDown(e: React.MouseEvent, node: PipelineNode) {
//     const nodeId = node.id;
//     const startX = e.clientX;
//     const startY = e.clientY;
//     const ox = node.x;
//     const oy = node.y;
//     dragState.current = { id: nodeId, startX, startY, ox, oy };

//     function onMove(ev: MouseEvent) {
//       const dx = ev.clientX - startX;
//       const dy = ev.clientY - startY;
//       setNodes((prev) =>
//         prev.map((n) =>
//           n.id === nodeId ? { ...n, x: Math.max(0, ox + dx), y: Math.max(0, oy + dy) } : n
//         )
//       );
//     }
//     function onUp() {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//       dragState.current = null;
//     }
//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//   }

//   function handleSourceUpload(nodeId: string, file: File) {
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => {
//         const parsedHeaders = res.meta.fields || [];
//         updateNodeConfig(nodeId, {
//           mode: "upload",
//           rows: res.data,
//           headers: parsedHeaders,
//           fileName: file.name,
//           connectionId: "",
//           connectionName: "",
//         });
//         setHeaders(parsedHeaders);
//         toast(`${file.name} loaded — ${(res.data as any[]).length} rows`);
//       },
//     });
//   }

//   async function handleSourceConnection(nodeId: string, connectionId: string) {
//     const conn = connections.find((c) => c._id === connectionId);
//     if (!conn) return;
//     toast("Fetching a sample from " + conn.name + "…");
//     const res = await fetch(`/api/connections/${connectionId}/test`, { method: "POST" });
//     const data = await res.json();
//     if (data.testResult?.ok) {
//       updateNodeConfig(nodeId, {
//         mode: "connection",
//         connectionId,
//         connectionName: conn.name,
//         rows: [], // resolved live at run time server-side
//         sampleRows: data.testResult.rows || [], // small sample, used for the data profile only
//         headers: data.testResult.headers,
//         fileName: "",
//       });
//       setHeaders(data.testResult.headers || []);
//       toast(`Connected — sample shows ${data.testResult.headers?.length || 0} columns`);
//     } else {
//       toast("Connection test failed: " + (data.testResult?.error || data.error));
//     }
//   }

//   function handleReferenceUpload(nodeId: string, file: File) {
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => {
//         updateNodeConfig(nodeId, {
//           referenceRows: res.data,
//           referenceHeaders: res.meta.fields || [],
//           referenceFileName: file.name,
//         });
//       },
//     });
//   }

//   async function savePipeline() {
//     const payload = { name, environment, headers, nodes,edges };
//     if (savedId) {
//       const res = await fetch(`/api/pipelines/${savedId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) toast("Pipeline saved");
//       return savedId;
//     } else {
//       const res = await fetch(`/api/pipelines`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setSavedId(data.pipeline._id);
//         toast("Pipeline created");
//         router.replace(`/dashboard/designer/${data.pipeline._id}`);
//         return data.pipeline._id;
//       }
//     }
//     return null;
//   }

//     const NEXT_ENV: Record<string, string> = { DEV: "SIT", SIT: "PROD" };

//   async function promotePipeline() {
//     if (!savedId) {
//       toast("Save the pipeline before promoting it");
//       return;
//     }
//     const target = NEXT_ENV[environment];
//     if (!target) {
//       toast("PROD is the top of the chain — nothing to promote to");
//       return;
//     }
//     setPromoting(true);
//     const res = await fetch(`/api/pipelines/${savedId}/promote`, { method: "POST" });
//     const data = await res.json();
//     setPromoting(false);
//     if (res.ok) {
//       toast(data.wasUpdate ? `Re-promoted to ${target} (updated existing copy)` : `Promoted to ${target}`);
//     } else {
//       toast("Promote failed: " + data.error);
//     }
//   }


//   async function runPipelineNow() {
//     const hasSource = nodes.some((n) => n.type === "source" && (n.config?.rows?.length || n.config?.connectionId));
//     if (!hasSource) {
//       toast("Add a Source node and attach a CSV or connection first");
//       return;
//     }
//     const idToUse = savedId || (await savePipeline());
//     if (!idToUse) return;
//     setRunning(true);
//     setLog([]);
//     const res = await fetch(`/api/pipelines/${idToUse}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
//     const data = await res.json();
//     setLog(data.steps || []);
//     setPreview({ rows: data.rows || [], headers: data.headers || headers });
//     setRunning(false);
//     toast(data.status === "success" ? "Pipeline finished" : "Pipeline finished with errors");
//   }

//   const selected = nodes.find((n) => n.id === selectedId) || null;

//   // return (
//   //   <div className="grid grid-cols-[210px_1fr_290px] h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm">
//   //     {/* PALETTE */}
//   //     <div className="border-r border-[#E3E7EF] bg-white p-3 overflow-y-auto">
//   //       <div className="mb-3">
//   //         <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Pipeline name</label>
//   //         <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
//   //       </div>
//   //       <div className="mb-4">
//   //         <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Environment</label>
//   //         <select className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
//   //           <option>DEV</option>
//   //           <option>SIT</option>
//   //           <option>PROD</option>
//   //         </select>
//   //       </div>

//   //       {TRANSFORM_GROUPS.map((g) => (
//   //         <div key={g.title}>
//   //           <h3 className="text-[10px] uppercase tracking-wide text-[#9AA1B2] mt-3 mb-1.5">{g.title}</h3>
//   //           {g.types.map((t) => (
//   //             <button
//   //               key={t}
//   //               onClick={() => addNode(t)}
//   //               className="w-full flex items-center gap-2 text-xs font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1.5 hover:border-[#2F6FED] hover:bg-[#2F6FED0d] text-left"
//   //             >
//   //               <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
//   //               {TRANSFORM_LABELS[t]}
//   //               <span className="ml-auto text-[#9AA1B2]">+</span>
//   //             </button>
//   //           ))}
//   //         </div>
//   //       ))}
//   //     </div>
//       return (
//     <div
//       className="grid h-[calc(100vh-56px)] bg-[#F4F6FA] text-[#1A2233] text-sm"
//       style={{ gridTemplateColumns: `${paletteCollapsed ? 52 : 210}px 1fr 290px` }}
//     >
//       {/* PALETTE */}
//       <div className="border-r border-[#E3E7EF] bg-white p-2 overflow-y-auto relative">
//         <button
//           onClick={() => setPaletteCollapsed((v) => !v)}
//           title={paletteCollapsed ? "Expand panel" : "Collapse panel — focus on the canvas"}
//           className="w-full flex items-center justify-center border border-[#E3E7EF] rounded-lg py-1.5 mb-2 text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] text-xs"
//         >
//           {paletteCollapsed ? "»" : "« Focus mode"}
//         </button>

//         {paletteCollapsed ? (
//           <div className="flex flex-col items-center gap-1.5">
//             {TRANSFORM_GROUPS.flatMap((g) => g.types).map((t) => (
//               <button
//                 key={t}
//                 onClick={() => addNode(t)}
//                 title={TRANSFORM_LABELS[t]}
//                 className="w-8 h-8 rounded-lg border border-[#E3E7EF] flex items-center justify-center hover:border-[#2F6FED]"
//               >
//                 <span className={`w-2.5 h-2.5 rounded-sm ${dotClassFor(t)}`} />
//               </button>
//             ))}
//           </div>
//         ) : (
//           <div className="px-1">
//         <div className="mb-3">
//           <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Pipeline name</label>
//           <input className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={name} onChange={(e) => setName(e.target.value)} />
//         </div>
//         <div className="mb-4">
//           <label className="block text-[10px] uppercase tracking-wide text-[#9AA1B2] mb-1">Environment</label>
//           <select className="w-full border border-[#E3E7EF] rounded px-2 py-1.5 text-xs" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
//             <option>DEV</option>
//             <option>SIT</option>
//             <option>PROD</option>
//           </select>
//         </div>

//         {TRANSFORM_GROUPS.map((g) => (
//           <div key={g.title}>
//             <h3 className="text-[10px] uppercase tracking-wide text-[#9AA1B2] mt-3 mb-1.5">{g.title}</h3>
//             {g.types.map((t) => (
//               <button
//                 key={t}
//                 onClick={() => addNode(t)}
//                 className="w-full flex items-center gap-2 text-xs font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1.5 hover:border-[#2F6FED] hover:bg-[#2F6FED0d] text-left"
//               >
//                 <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
//                 {TRANSFORM_LABELS[t]}
//                 <span className="ml-auto text-[#9AA1B2]">+</span>
//               </button>
//             ))}
//           </div>
//         ))}
//           </div>
//         )}
//       </div>
//       {/* CANVAS */}
//       <div ref={canvasRef} className="relative overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #E3E7EF 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
//         <div className="relative" style={{ width: 1400, height: 1000 }}>
//           {/* <svg className="absolute inset-0 w-full h-full pointer-events-none">
//             {nodes.slice(0, -1).map((a, i) => {
//               const b = nodes[i + 1];
//               const x1 = a.x + 190, y1 = a.y + 35, x2 = b.x, y2 = b.y + 35, mid = (x1 + x2) / 2;
//               return <path key={a.id} d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`} stroke="#2F6FED55" strokeWidth={2} fill="none" />;
//             })}
//           </svg> */}
//                 {/* SVG layer — wires + dragging wire */}
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 1 }}
//       >
//         <defs>
//           <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
//             <polygon points="0 0, 8 3, 0 6" fill="#2F6FED" opacity="0.7" />
//           </marker>
//         </defs>

//         {/* Existing edges */}
//         {edges.map((edge) => {
//           const fromNode = nodes.find((n) => n.id === edge.from);
//           const toNode = nodes.find((n) => n.id === edge.to);
//           if (!fromNode || !toNode) return null;
//           const x1 = fromNode.x + 190;
//           const y1 = fromNode.y + 36;
//           const x2 = toNode.x;
//           const y2 = toNode.y + 36;
//           const mx = (x1 + x2) / 2;
//           return (
//             <g key={edge.id} className="pointer-events-auto">
//               <path
//                 d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
//                 fill="none"
//                 stroke="transparent"
//                 strokeWidth={12}
//                 className="cursor-pointer"
//                 onClick={() => setEdges((prev) => prev.filter((e) => e.id !== edge.id))}
//               />
//               <path
//                 d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
//                 fill="none"
//                 stroke="#2F6FED"
//                 strokeWidth={1.5}
//                 opacity={0.6}
//                 markerEnd="url(#arrowhead)"
//               />
//             </g>
//           );
//         })}

//         {/* Wire being dragged */}
//         {draggingWire && (
//           <path
//             d={`M ${draggingWire.fromX} ${draggingWire.fromY} C ${(draggingWire.fromX + draggingWire.mouseX) / 2} ${draggingWire.fromY} ${(draggingWire.fromX + draggingWire.mouseX) / 2} ${draggingWire.mouseY} ${draggingWire.mouseX} ${draggingWire.mouseY}`}
//             fill="none"
//             stroke="#2F6FED"
//             strokeWidth={1.5}
//             strokeDasharray="6 3"
//             opacity={0.8}
//           />
//         )}
//       </svg>

//           {nodes.length === 0 && (
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#6B7385] w-80">
//               <h3 className="text-base font-semibold text-[#1A2233] mb-2">This pipeline is empty</h3>
//               <p className="text-xs leading-relaxed">
//                 Start with a <b>Source</b> node (CSV or a saved connection), then add transforms, then finish with a <b>Target</b>.
//               </p>
//             </div>
//           )}

//           {nodes.map((n, i) => (
//             <div
//               key={n.id}
//               onMouseDown={(e) => onNodeMouseDown(e, n)}
//               onClick={() => setSelectedId(n.id)}
//               className={`absolute w-[190px] bg-white border rounded-xl px-3.5 py-3 cursor-grab shadow-sm border-t-[3px] ${borderClassFor(n.type)} ${
//                 n.id === selectedId ? "border-[#2F6FED] ring-2 ring-[#2F6FED22]" : "border-[#E3E7EF]"
//               }`}
//               style={{ left: n.x, top: n.y }}
//             >
//               <div className="flex justify-between items-center text-[13px] font-semibold">
//                 <span>{n.label}</span>
//                 <StatusDot nodeId={n.id} log={log} />
//               </div>
//               <div className="text-[9.5px] font-mono text-[#9AA1B2] mt-0.5 uppercase tracking-wide">step {i + 1} · {n.type}</div>
//               {n.type === "source" && (
//                 <div className="text-[10.5px] font-mono text-[#2F6FED] mt-1.5 truncate">
//                   {n.config.connectionName || n.config.fileName || "not configured"}
//                 </div>
//               )}
//               <div className="text-[10.5px] font-mono text-[#9AA1B2] mt-1.5">
//                 <RowInfo nodeId={n.id} log={log} />
//               </div>
//               <button
//                 onClick={(e) => { e.stopPropagation(); removeNode(n.id); }}
//                 className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-white border border-[#E3E7EF] text-[10px] text-[#9AA1B2] hover:text-red-500 hover:border-red-400 flex items-center justify-center"
//               >
//                 ✕
//               </button>

//               {/* Output port — drag from here */}
//               <div
//                 onMouseDown={(e) => {
//                   e.stopPropagation();
//                   const fromX = n.x + 190;
//                   const fromY = n.y + 36;
//                   setDraggingWire({ fromNodeId: n.id, fromX, fromY, mouseX: fromX, mouseY: fromY });
//                 }}
//                 className="absolute w-2.5 h-2.5 rounded-full bg-[#2F6FED] border-2 border-white shadow cursor-crosshair hover:scale-125 transition-transform"
//                 style={{ right: -5, top: 30 }}
//                 title="Drag to connect to next step"
//               />

//               {/* Input port — drop here */}
//               <div
//                 onMouseEnter={() => draggingWire && setHoveredPort({ nodeId: n.id, side: "in" })}
//                 onMouseLeave={() => setHoveredPort((p) => (p?.nodeId === n.id ? null : p))}
//                 className={`absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow transition-transform ${
//                   hoveredPort?.nodeId === n.id && hoveredPort.side === "in"
//                     ? "bg-emerald-500 scale-150"
//                     : "bg-[#9AA1B2]"
//                 }`}
//                 style={{ left: -5, top: 30 }}
//                 title="Drop to connect"
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* INSPECTOR */}
//       <div className="border-l border-[#E3E7EF] bg-white p-4 overflow-y-auto">
//         {!selected ? (
//           <div className="text-[#6B7385] text-xs text-center mt-10">Select a node to configure it.</div>
//         ) : (
//  <NodeInspector
//             node={selected}
//             headers={headers}
//             connections={connections}
//             allNodes={nodes}
//             onChange={(patch) => updateNodeConfig(selected.id, patch)}
//             onReferenceUpload={(file) => handleReferenceUpload(selected.id, file)}
//             onSourceUpload={(file) => handleSourceUpload(selected.id, file)}
//             onSourceConnection={(connId) => handleSourceConnection(selected.id, connId)}
//             onOpenProfile={(nodeId) => setProfileModalNodeId(nodeId)}
//             onOpenAiSuggest={(nodeId) => setAiSuggestNodeId(nodeId)}
//           />
//         )}

//         <div className="mt-5 pt-4 border-t border-[#E3E7EF]">
//           <h3 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] mb-2">Execution log</h3>
//           {log.length === 0 ? (
//             <div className="text-[11px] text-[#9AA1B2]">No runs yet.</div>
//           ) : (
//             <div className="space-y-1.5">
//               {[...log].reverse().map((s, i) => (
//                 <div key={i} className={`text-[11px] font-mono bg-[#FAFBFD] rounded px-2 py-1.5 border-l-2 ${s.ok ? "border-emerald-500" : "border-red-500 text-red-600"}`}>
//                   <div className="font-semibold text-[#1A2233]">{s.label}</div>
//                   <div>{s.message}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* <div className="fixed top-3 right-6 flex gap-2 z-30">
//         <button onClick={savePipeline} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save pipeline</button>
//         <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
//           {running ? "Running…" : "▶ Run pipeline"}
//         </button>
//       </div> */}

//         <div className="fixed top-3 z-30 flex gap-1.5" style={{ left: (paletteCollapsed ? 52 : 210) + 16 }}>
//         <button
//           onClick={undo}
//           disabled={history.length === 0}
//           title="Undo (Ctrl+Z)"
//           className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] bg-white rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30 disabled:hover:border-[#E3E7EF] disabled:hover:text-[#6B7385]"
//         >
//           <Undo2 size={14} />
//         </button>
//         <button
//           onClick={redo}
//           disabled={redoStack.length === 0}
//           title="Redo (Ctrl+Shift+Z)"
//           className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] bg-white rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30 disabled:hover:border-[#E3E7EF] disabled:hover:text-[#6B7385]"
//         >
//           <Redo2 size={14} />
//         </button>
//       </div>

//       <div className="fixed top-3 right-6 flex gap-2 z-30">
//         {promotedFrom && (
//           <button
//             onClick={() => router.push(`/dashboard/pipelines/diff/${savedId}`)}
//             className="text-xs font-semibold border border-[#E3E7EF] text-[#6B7385] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]"
//           >
//             View diff vs source →
//           </button>
//         )}
//         <button
//           onClick={() => {
//             const hasSource = nodes.some((n) => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
//             if (!hasSource) { toast("Add a Source node with data first"); return; }
//             setShowGenerateModal(true);
//           }}
//           className="text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] bg-white rounded-lg px-3.5 py-2 hover:bg-[#7C6AE814] flex items-center gap-1.5"
//         >
//           ✨ Generate from prompt
//         </button>
//         <button
//           onClick={() => setShowCopilot((v) => !v)}
//           className={`text-xs font-semibold border rounded-lg px-3.5 py-2 flex items-center gap-1.5 transition-colors ${
//             showCopilot
//               ? "border-[#7C6AE8] bg-[#7C6AE8] text-white"
//               : "border-[#7C6AE8] text-[#7C6AE8] bg-white hover:bg-[#7C6AE814]"
//           }`}
//         >
//           💬 {showCopilot ? "Close copilot" : "Copilot"}
//         </button>
//         {environment !== "PROD" && (
//           <button onClick={promotePipeline} disabled={promoting} className="text-xs font-semibold border border-[#D98A1E] text-[#D98A1E] bg-white rounded-lg px-3.5 py-2 hover:bg-[#D98A1E14] disabled:opacity-50">
//             {promoting ? "Promoting…" : `Promote to ${environment === "DEV" ? "SIT" : "PROD"} →`}
//           </button>
//         )}
//         <button onClick={savePipeline} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3.5 py-2 hover:border-[#2F6FED]">Save pipeline</button>
//         <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 hover:bg-[#245BD1] disabled:opacity-50">
//           {running ? "Running…" : "▶ Run pipeline"}
//         </button>
//       </div>

//       {preview && (
//         <div className="fixed bottom-0 right-[290px] bg-white border-t border-[#E3E7EF] max-h-64 overflow-hidden z-20" style={{ left: paletteCollapsed ? 52 : 210 }}>
//           <div className="flex justify-between items-center px-4 py-2 border-b border-[#E3E7EF]">
//             <h3 className="text-xs font-semibold">Output preview — {preview.rows.length} rows total, showing {Math.min(25, preview.rows.length)}</h3>
//             <div className="flex gap-2">
//               <button onClick={() => downloadOutput(preview, "csv", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ CSV</button>
//               <button onClick={() => downloadOutput(preview, "json", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ JSON</button>
//               <button onClick={() => setPreview(null)} className="text-xs border border-[#E3E7EF] rounded px-2 py-1">Close</button>
//             </div>
//           </div>
//           <div className="overflow-auto p-3" style={{ maxHeight: 200 }}>
// <table className="text-xs w-full">
//   <thead>
//     <tr>{preview.headers.map((h, hi) => <th key={`${h}_${hi}`} className="text-left px-2.5 py-1.5 text-[#2F6FED] font-mono font-medium whitespace-nowrap">{h}</th>)}</tr>
//   </thead>
//               <tbody>
//                 {preview.rows.slice(0, 25).map((r, i) => (
//                    <tr key={i}>{preview.headers.map((h, hi) => <td key={`${h}_${hi}`} className="px-2.5 py-1.5 text-[#6B7385] whitespace-nowrap border-t border-[#F0F2F6]">{String(r[h] ?? "")}</td>)}</tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

// {toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A2233] text-white text-xs px-4 py-2.5 rounded-lg z-50">{toastMsg}</div>}

// {profileModalNodeId && (() => {
//         const profileNode = nodes.find((n) => n.id === profileModalNodeId);
//         if (!profileNode) return null;
//         const isSample = profileNode.config.mode === "connection";
//         const profileRows = isSample ? profileNode.config.sampleRows || [] : profileNode.config.rows || [];
//         return (
//           <DataProfileModal
//             rows={profileRows}
//             headers={headers}
//             isSample={isSample}
//             onClose={() => setProfileModalNodeId(null)}
//           />
//         );
//       })()}
      
// {aiSuggestNodeId && (() => {
//         const srcNode = nodes.find((n) => n.id === aiSuggestNodeId);
//         if (!srcNode) return null;
//         const isSample = srcNode.config.mode === "connection";
//         const dataRows = isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || [];
//         return (
//           <AiSuggestModal
//             rows={dataRows}
//             headers={headers}
//             onAddNodes={addSuggestedNodes}
//             onClose={() => setAiSuggestNodeId(null)}
//           />
//         );
//       })()}

//       {showGenerateModal && (() => {
//         const srcNode = nodes.find((n) => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
//         const isSample = srcNode?.config.mode === "connection";
//         const dataRows = srcNode ? (isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || []) : [];
//         const hasExistingSteps = nodes.some((n) => n.type !== "source");
//         return (
//           <AiGeneratePipelineModal
//             rows={dataRows}
//             headers={headers}
//             hasExistingSteps={hasExistingSteps}
//             onApply={applyGeneratedPipeline}
//             onClose={() => setShowGenerateModal(false)}
//           />
//         );
//       })()}

//             {showCopilot && (
//         <CopilotChat
//           nodes={nodes}
//           headers={headers}
//           onApplyOperations={applyCopilotOperations}
//           onClose={() => setShowCopilot(false)}
//         />
//       )}
//     </div>
//   );
// }
// function downloadOutput(preview: { rows: Row[]; headers: string[] }, format: "csv" | "json", pipelineName: string) {
//   let content: string;
//   let mime: string;
//   let ext: string;

//   if (format === "json") {
//     content = JSON.stringify(preview.rows, null, 2);
//     mime = "application/json";
//     ext = "json";
//   } else {
//     const escape = (v: any) => {
//       const s = String(v ?? "");
//       return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
//     };
//     const lines = [preview.headers.join(",")];
//     for (const row of preview.rows) {
//       lines.push(preview.headers.map((h) => escape(row[h])).join(","));
//     }
//     content = lines.join("\n");
//     mime = "text/csv";
//     ext = "csv";
//   }

//   const blob = new Blob([content], { type: mime });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${pipelineName.replace(/\s+/g, "_")}_output.${ext}`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// function StatusDot({ nodeId, log }: { nodeId: string; log: RunLogStep[] }) {
//   const entry = log.find((l) => l.nodeId === nodeId);
//   if (!entry) return <span className="w-[7px] h-[7px] rounded-full bg-[#E3E7EF]" />;
//   return <span className={`w-[7px] h-[7px] rounded-full ${entry.ok ? "bg-emerald-500" : "bg-red-500"}`} />;
// }
// function RowInfo({ nodeId, log }: { nodeId: string; log: RunLogStep[] }) {
//   const entry = log.find((l) => l.nodeId === nodeId);
//   if (!entry) return <>not yet run</>;
//   return <>{entry.rowsOut} rows</>;
// }

// function NodeInspector({
//   node,
//   headers,
//   connections,
//   allNodes,
//   onChange,
//   onReferenceUpload,
//   onSourceUpload,
//   onSourceConnection,
//   onOpenProfile,
//   onOpenAiSuggest,
// }: {
//   node: PipelineNode;
//   headers: string[];
//   connections: any[];
//   allNodes: PipelineNode[];
//   onChange: (patch: Record<string, any>) => void;
//   onReferenceUpload: (file: File) => void;
//   onSourceUpload: (file: File) => void;
//   onSourceConnection: (connectionId: string) => void;
//   onOpenProfile: (nodeId: string) => void;
//   onOpenAiSuggest: (nodeId: string) => void;
// }) {

//   const cfg = node.config || {};
//   const selectCls = "w-full border border-[#E3E7EF] bg-[#FAFBFD] rounded px-2 py-1.5 text-xs";
//   const labelCls = "block text-[11px] font-mono text-[#6B7385] mb-1";

//   const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
//     <div className="mb-3"><label className={labelCls}>{label}</label>{children}</div>
//   );

//   const refUploader = (
//     <Field label={cfg.referenceFileName ? `Reference file: ${cfg.referenceFileName}` : "Reference CSV"}>
//       <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-2 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
//         {cfg.referenceFileName ? "Replace file" : "Upload reference CSV"}
//         <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReferenceUpload(f); }} />
//       </label>
//     </Field>
//   );

//   const refHeaders: string[] = cfg.referenceHeaders || [];

//   return (
//     <div>
//       <h3 className="text-sm font-semibold">{node.label}</h3>
//       <div className="text-[11px] font-mono text-[#9AA1B2] mb-3">step config</div>

//       {node.type === "source" && (
//         <>
//           <Field label="Source type">
//             <div className="flex gap-1.5 mb-2">
//               <button onClick={() => onChange({ mode: "upload" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "upload" || !cfg.mode ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>CSV upload</button>
//               <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Saved connection</button>
//             </div>
//           </Field>
//           {cfg.mode === "connection" ? (
//             <Field label="Connection">
//               <select className={selectCls} value={cfg.connectionId || ""} onChange={(e) => onSourceConnection(e.target.value)}>
//                 <option value="">Select a connection…</option>
//                 {connections.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}
//               </select>
//               {connections.length === 0 && <p className="text-[11px] text-[#6B7385] mt-1.5">No connections yet — add one on the Connections page.</p>}
//             </Field>
//  ) : (
//             <Field label={cfg.fileName ? `Loaded: ${cfg.fileName}` : "CSV file"}>
//               <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-3 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
//                 {cfg.fileName ? `✓ ${cfg.rows?.length || 0} rows — replace file` : "Upload CSV"}
//                 <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSourceUpload(f); }} />
//               </label>
//             </Field>
//           )}
// {((cfg.mode === "upload" && cfg.rows?.length) || (cfg.mode === "connection" && cfg.sampleRows?.length)) ? (
//             <>
//               <button onClick={() => onOpenProfile(node.id)} className="w-full text-xs font-semibold border border-[#E3E7EF] rounded-lg py-2 mt-1 hover:border-[#2F6FED] hover:text-[#2F6FED]">
//                 📊 View data profile
//               </button>
//               <button onClick={() => onOpenAiSuggest(node.id)} className="w-full text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] rounded-lg py-2 mt-2 hover:bg-[#7C6AE814]">
//                 ✨ Suggest transforms (AI)
//               </button>
//             </>
//           ) : null}
//         </>
//       )}

//       {node.type === "filter" && (
//         <>
//           <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Condition">
//             <select className={selectCls} value={cfg.op} onChange={(e) => onChange({ op: e.target.value })}>
//               <option value="not_empty">Is not empty</option>
//               <option value="empty">Is empty</option>
//               <option value="gt">Greater than</option>
//               <option value="lt">Less than</option>
//               <option value="eq">Equals</option>
//               <option value="neq">Not equals</option>
//               <option value="contains">Contains</option>
//             </select>
//           </Field>
//           {["gt", "lt", "eq", "neq", "contains"].includes(cfg.op) && (
//             <Field label="Value"><input className={selectCls} value={cfg.value || ""} onChange={(e) => onChange({ value: e.target.value })} /></Field>
//           )}
//         </>
//       )}

//       {node.type === "rename" && (
//         <>
//           <Field label="From column"><select className={selectCls} value={cfg.from} onChange={(e) => onChange({ from: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="To (new name)"><input className={selectCls} value={cfg.to || ""} onChange={(e) => onChange({ to: e.target.value })} placeholder="e.g. customer_name" /></Field>
//         </>
//       )}

//       {node.type === "nulls" && (
//         <>
//           <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Strategy">
//             <select className={selectCls} value={cfg.strategy} onChange={(e) => onChange({ strategy: e.target.value })}>
//               <option value="drop_row">Drop row</option>
//               <option value="fill_zero">Fill with 0</option>
//               <option value="fill_na">Fill with N/A</option>
//             </select>
//           </Field>
//         </>
//       )}

//     {node.type === "expression" && (
//         <>
//           {/* Tab bar */}
//           {(() => {
//             const tab = cfg._tab || "output";
//             const setTab = (t: string) => onChange({ _tab: t });

//             const outputPorts: { name: string; expr: string }[] =
//               cfg.outputPorts?.length ? cfg.outputPorts
//               : cfg.columns?.length ? cfg.columns
//               : cfg.name ? [{ name: cfg.name, expr: cfg.expr || "" }]
//               : [{ name: "", expr: "" }];

//             const variablePorts: { name: string; expr: string }[] = cfg.variablePorts || [];
//             const inputMacros: { name: string; value: string; description?: string }[] = cfg.inputMacros || [];
//             const outputMacros: { name: string; expr: string }[] = cfg.outputMacros || [];

//             const tabs = [
//               { key: "input", label: "Input ports", count: headers.length },
//               { key: "output", label: "Output ports", count: outputPorts.filter(p => p.name).length },
//               { key: "variable", label: "Variable ports", count: variablePorts.filter(p => p.name).length },
//               { key: "imacro", label: "Input macros", count: inputMacros.filter(p => p.name).length },
//               { key: "omacro", label: "Output macros", count: outputMacros.filter(p => p.name).length },
//             ];

//             return (
//               <div>
//                 {/* Tabs */}
//                 <div className="flex gap-1 flex-wrap mb-3">
//                   {tabs.map((t) => (
//                     <button
//                       key={t.key}
//                       onClick={() => setTab(t.key)}
//                       className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
//                         tab === t.key
//                           ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]"
//                           : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"
//                       }`}
//                     >
//                       {t.label}
//                       {t.count > 0 && (
//                         <span className="ml-1 text-[9px] bg-[#E3E7EF] text-[#6B7385] rounded-full px-1.5 py-0.5">{t.count}</span>
//                       )}
//                     </button>
//                   ))}
//                 </div>

//                 {/* INPUT PORTS — read-only reference */}
//                 {tab === "input" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Incoming columns from upstream — available as variables in all expressions.</p>
//                     <div className="space-y-1">
//                       {headers.length === 0 && <p className="text-[11px] text-[#9AA1B2]">No upstream columns yet — attach a Source first.</p>}
//                       {headers.map((h) => (
//                         <div key={h} className="flex items-center gap-2 bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-1.5">
//                           <span className="w-2 h-2 rounded-full bg-[#5B9CF6] flex-shrink-0" />
//                           <span className="text-[12px] font-mono text-[#1A2233]">{h}</span>
//                           <span className="ml-auto text-[10px] text-[#9AA1B2]">input</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* OUTPUT PORTS */}
//                 {tab === "output" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">New columns added to the output row. Use any input column name or variable port name as a variable.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {outputPorts.map((col, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#1FA971]" /> Output {i + 1}
//                             </span>
//                             {outputPorts.length > 1 && (
//                               <button onClick={() => {
//                                 const updated = outputPorts.filter((_, ci) => ci !== i);
//                                 onChange({ outputPorts: updated, name: undefined, expr: undefined, columns: undefined });
//                               }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                             )}
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={col.name} placeholder="Output column name" onChange={(e) => {
//                             const updated = outputPorts.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ outputPorts: updated, name: undefined, expr: undefined, columns: undefined });
//                           }} />
//                           <input className={`${selectCls} font-mono text-[11.5px]`} value={col.expr} placeholder="e.g. salary * 1.1" onChange={(e) => {
//                             const updated = outputPorts.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c);
//                             onChange({ outputPorts: updated, name: undefined, expr: undefined, columns: undefined });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ outputPorts: [...outputPorts, { name: "", expr: "" }], name: undefined, expr: undefined, columns: undefined })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]">
//                       + Add output port
//                     </button>
//                   </div>
//                 )}

//                 {/* VARIABLE PORTS */}
//                 {tab === "variable" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Intermediate computed values — usable in output port expressions but NOT added to the output row. Like local variables in IICS.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {variablePorts.length === 0 && (
//                         <p className="text-[11px] text-[#9AA1B2]">No variable ports yet.</p>
//                       )}
//                       {variablePorts.map((col, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#D98A1E]" /> Variable {i + 1}
//                             </span>
//                             <button onClick={() => {
//                               const updated = variablePorts.filter((_, ci) => ci !== i);
//                               onChange({ variablePorts: updated });
//                             }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={col.name} placeholder="Variable name (not in output)" onChange={(e) => {
//                             const updated = variablePorts.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ variablePorts: updated });
//                           }} />
//                           <input className={`${selectCls} font-mono text-[11.5px]`} value={col.expr} placeholder="e.g. salary * 12" onChange={(e) => {
//                             const updated = variablePorts.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c);
//                             onChange({ variablePorts: updated });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ variablePorts: [...variablePorts, { name: "", expr: "" }] })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#D98A1E] hover:text-[#D98A1E]">
//                       + Add variable port
//                     </button>
//                   </div>
//                 )}

//                 {/* INPUT MACROS */}
//                 {tab === "imacro" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Named constants or parameters — define a value once, reference it by name in any expression. Like $$parameter in IICS.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {inputMacros.length === 0 && (
//                         <p className="text-[11px] text-[#9AA1B2]">No input macros yet.</p>
//                       )}
//                       {inputMacros.map((m, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#7C6AE8]" /> Macro {i + 1}
//                             </span>
//                             <button onClick={() => {
//                               const updated = inputMacros.filter((_, ci) => ci !== i);
//                               onChange({ inputMacros: updated });
//                             }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={m.name} placeholder="Macro name (use in expressions)" onChange={(e) => {
//                             const updated = inputMacros.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ inputMacros: updated });
//                           }} />
//                           <input className={`${selectCls}`} value={m.value} placeholder="Value (e.g. 0.18 for tax rate)" onChange={(e) => {
//                             const updated = inputMacros.map((c, ci) => ci === i ? { ...c, value: e.target.value } : c);
//                             onChange({ inputMacros: updated });
//                           }} />
//                           <input className={`${selectCls} mt-1 text-[11px] text-[#9AA1B2]`} value={m.description || ""} placeholder="Description (optional)" onChange={(e) => {
//                             const updated = inputMacros.map((c, ci) => ci === i ? { ...c, description: e.target.value } : c);
//                             onChange({ inputMacros: updated });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ inputMacros: [...inputMacros, { name: "", value: "", description: "" }] })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#7C6AE8] hover:text-[#7C6AE8]">
//                       + Add input macro
//                     </button>
//                   </div>
//                 )}

//                 {/* OUTPUT MACROS */}
//                 {tab === "omacro" && (
//                   <div>
//                     <p className="text-[11px] text-[#6B7385] mb-2">Parameterized output columns — like output ports but intended for reusable, parameterized transformations. Added to output row.</p>
//                     <div className="space-y-2.5 mb-2">
//                       {outputMacros.length === 0 && (
//                         <p className="text-[11px] text-[#9AA1B2]">No output macros yet.</p>
//                       )}
//                       {outputMacros.map((col, i) => (
//                         <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className="text-[10px] font-mono text-[#9AA1B2] uppercase tracking-wide flex items-center gap-1.5">
//                               <span className="w-2 h-2 rounded-full bg-[#DA4B4B]" /> Output macro {i + 1}
//                             </span>
//                             <button onClick={() => {
//                               const updated = outputMacros.filter((_, ci) => ci !== i);
//                               onChange({ outputMacros: updated });
//                             }} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>
//                           </div>
//                           <input className={`${selectCls} mb-1`} value={col.name} placeholder="Output column name" onChange={(e) => {
//                             const updated = outputMacros.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c);
//                             onChange({ outputMacros: updated });
//                           }} />
//                           <input className={`${selectCls} font-mono text-[11.5px]`} value={col.expr} placeholder="e.g. salary * TAX_RATE" onChange={(e) => {
//                             const updated = outputMacros.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c);
//                             onChange({ outputMacros: updated });
//                           }} />
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={() => onChange({ outputMacros: [...outputMacros, { name: "", expr: "" }] })}
//                       className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#DA4B4B] hover:text-[#DA4B4B]">
//                       + Add output macro
//                     </button>
//                   </div>
//                 )}

//                 <div className="mt-3 pt-2.5 border-t border-[#E3E7EF] text-[11px] text-[#9AA1B2] leading-relaxed">
//                   <strong className="text-[#6B7385]">Execution order:</strong> Input macros → Variable ports → Output ports → Output macros.
//                   Variables can reference input columns and macros. Output ports can reference variables, input columns, and macros.
//                 </div>
//               </div>
//             );
//           })()}
//         </>
//       )}

//       {node.type === "sequence" && (
//         <>
//           <Field label="Output column name"><input className={selectCls} value={cfg.outputColumn || ""} onChange={(e) => onChange({ outputColumn: e.target.value })} placeholder="e.g. surrogate_key" /></Field>
//           <Field label="Start at"><input type="number" className={selectCls} value={cfg.startAt ?? 1} onChange={(e) => onChange({ startAt: Number(e.target.value) })} /></Field>
//           <Field label="Step"><input type="number" className={selectCls} value={cfg.step ?? 1} onChange={(e) => onChange({ step: Number(e.target.value) })} /></Field>
//           <p className="text-[11px] text-[#6B7385] leading-relaxed">Adds an auto-incrementing column — useful for generating surrogate keys before loading into a Target.</p>
//         </>
//       )}


//       {node.type === "sorter" && (
//         <>
//           <Field label="Column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={(e) => onChange({ direction: e.target.value })}><option value="asc">Ascending</option><option value="desc">Descending</option></select></Field>
//         </>
//       )}

//       {node.type === "rank" && (
//         <>
//           <Field label="Rank by column"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Output column name"><input className={selectCls} value={cfg.outputColumn || ""} onChange={(e) => onChange({ outputColumn: e.target.value })} /></Field>
//           <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={(e) => onChange({ direction: e.target.value })}><option value="desc">Highest = rank 1</option><option value="asc">Lowest = rank 1</option></select></Field>
//         </>
//       )}

//       {node.type === "aggregator" && (
//         <>
//           <Field label="Group by column"><select className={selectCls} value={cfg.groupBy} onChange={(e) => onChange({ groupBy: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Target column"><select className={selectCls} value={cfg.targetColumn} onChange={(e) => onChange({ targetColumn: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Function"><select className={selectCls} value={cfg.fn} onChange={(e) => onChange({ fn: e.target.value })}><option value="sum">Sum</option><option value="avg">Average</option><option value="count">Count</option><option value="min">Min</option><option value="max">Max</option></select></Field>
//         </>
//       )}

//       {node.type === "router" && (
//         <>
//           <Field label="Column to route on"><select className={selectCls} value={cfg.column} onChange={(e) => onChange({ column: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <p className="text-[11px] text-[#6B7385] leading-relaxed">Rows get tagged with a <code>route</code> column based on rules below.</p>
//           {(cfg.routes || []).map((rt: any, i: number) => (
//             <div key={i} className="flex gap-1.5 mt-2">
//               <input className="w-1/2 border border-[#E3E7EF] rounded px-2 py-1 text-xs" placeholder="route name" value={rt.name} onChange={(e) => { const routes = [...cfg.routes]; routes[i] = { ...routes[i], name: e.target.value }; onChange({ routes }); }} />
//               <input className="w-1/2 border border-[#E3E7EF] rounded px-2 py-1 text-xs" placeholder="matches value" value={rt.value} onChange={(e) => { const routes = [...cfg.routes]; routes[i] = { ...routes[i], value: e.target.value }; onChange({ routes }); }} />
//             </div>
//           ))}
//           <button className="text-xs text-[#2F6FED] mt-2" onClick={() => onChange({ routes: [...(cfg.routes || []), { name: "", value: "" }] })}>+ Add route</button>
//         </>
//       )}

//       {node.type === "union" && <>{refUploader}</>}

//       {node.type === "joiner" && (
//         <>
//           {refUploader}
//           <Field label="Left key (this pipeline)"><select className={selectCls} value={cfg.leftKey} onChange={(e) => onChange({ leftKey: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Right key (reference CSV)"><select className={selectCls} value={cfg.rightKey} onChange={(e) => onChange({ rightKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Join type"><select className={selectCls} value={cfg.joinType} onChange={(e) => onChange({ joinType: e.target.value })}><option value="inner">Inner join</option><option value="left">Left join</option></select></Field>
//         </>
//       )}

//       {node.type === "lookup" && (
//         <>
//           {refUploader}
//           <Field label="Key in this pipeline"><select className={selectCls} value={cfg.key} onChange={(e) => onChange({ key: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <Field label="Key in reference CSV"><select className={selectCls} value={cfg.lookupKey} onChange={(e) => onChange({ lookupKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <p className="text-[11px] text-[#6B7385] mt-1">Columns to copy from the reference row (comma separated):</p>
//           <input className={selectCls + " mt-1"} placeholder="e.g. price, category" value={(cfg.copyColumns || []).join(", ")} onChange={(e) => onChange({ copyColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
//         </>
//       )}

//       {node.type === "updateStrategy" && (
//         <>
//           {refUploader}
//           <Field label="Key column (identifies a record)"><select className={selectCls} value={cfg.key} onChange={(e) => onChange({ key: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></Field>
//           <p className="text-[11px] text-[#6B7385] leading-relaxed">Compares each row against the reference snapshot and tags it INSERT / UPDATE / NOCHANGE / DELETE.</p>
//         </>
//       )}

//             {/* {(node.type === "scd1" || node.type === "scd2" || node.type === "scd3") && (
//         <>
//           <div className="text-[11px] text-[#6B7385] bg-[#F4F6FA] rounded-lg px-3 py-2 mb-3 leading-relaxed">
//             {node.type === "scd1" && "Type 1 — Overwrite. When a key match is found and tracked columns changed, the row is updated in place. Previous values are lost. Tags: INSERT | UPDATE | NOCHANGE."}
//             {node.type === "scd2" && "Type 2 — Full history. Changed rows spawn a new current row + an expired old row with start/end dates. Tags: INSERT | UPDATE | EXPIRE | NOCHANGE."}
//             {node.type === "scd3" && "Type 3 — Previous value columns. Adds _prev_<column> for each tracked column so you can see what changed. One level of history only. Tags: INSERT | UPDATE | NOCHANGE."}
//           </div>

//           <Field label="Business key column">
//             <select className={selectCls} value={cfg.keyColumn || ""} onChange={(e) => onChange({ keyColumn: e.target.value })}>
//               <option value="">Select key column…</option>
//               {headers.map((h) => <option key={h} value={h}>{h}</option>)}
//             </select>
//           </Field>

//           {node.type === "scd2" && (
//             <Field label="Surrogate key column name">
//               <input className={selectCls} value={cfg.surrogateColumn || "surrogate_key"} onChange={(e) => onChange({ surrogateColumn: e.target.value })} placeholder="surrogate_key" />
//             </Field>
//           )}

//           <Field label="Tracked columns (compare for changes)">
//             <div className="space-y-1.5">
//               {headers.filter((h) => h !== cfg.keyColumn).map((h) => {
//                 const checked = (cfg.compareColumns || []).includes(h);
//                 return (
//                   <label key={h} className="flex items-center gap-2 text-[12px] cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={() => {
//                         const current: string[] = cfg.compareColumns || [];
//                         onChange({ compareColumns: checked ? current.filter((c: string) => c !== h) : [...current, h] });
//                       }}
//                     />
//                     <span className="font-mono">{h}</span>
//                   </label>
//                 );
//               })}
//               {headers.length === 0 && <p className="text-[11px] text-[#9AA1B2]">Attach a Source first to see columns.</p>}
//             </div>
//           </Field>

//           <Field label="Snapshot / reference data">
//             <label className="block border border-dashed border-[#E3E7EF] rounded px-2 py-3 text-[11px] text-center cursor-pointer hover:border-[#2F6FED]">
//               {cfg.referenceHeaders?.length
//                 ? `✓ ${cfg.referenceRows?.length || 0} snapshot rows loaded`
//                 : "Upload snapshot CSV (previous state)"}
//               <input type="file" accept=".csv" className="hidden" onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 import("papaparse").then(({ default: Papa }) => {
//                   Papa.parse(file, {
//                     header: true,
//                     skipEmptyLines: true,
//                     complete: (result) => {
//                       onChange({
//                         referenceRows: result.data,
//                         referenceHeaders: result.meta.fields || [],
//                       });
//                     },
//                   });
//                 });
//               }} />
//             </label>
//             {cfg.referenceHeaders?.length > 0 && (
//               <p className="text-[11px] text-[#9AA1B2] mt-1">
//                 Columns: {cfg.referenceHeaders.slice(0, 5).join(", ")}{cfg.referenceHeaders.length > 5 ? ` +${cfg.referenceHeaders.length - 5} more` : ""}
//               </p>
//             )}
//           </Field>

//           <div className="mt-3 pt-3 border-t border-[#E3E7EF] text-[11px] text-[#9AA1B2] leading-relaxed">
//             <strong className="text-[#6B7385]">Output columns added:</strong>
//             {node.type === "scd1" && " _scd_action"}
//             {node.type === "scd2" && " surrogate_key, _scd_start_date, _scd_end_date, _scd_is_current, _scd_action"}
//             {node.type === "scd3" && ` _prev_<column> for each tracked column, _scd_action, _scd_change_date`}
//           </div>
//         </>
//       )} */}
//             {(node.type === "scd1" || node.type === "scd2" || node.type === "scd3") && (
//         <>
//           <div className="text-[11px] text-[#6B7385] bg-[#F4F6FA] rounded-lg px-3 py-2 mb-3 leading-relaxed">
//             {node.type === "scd1" && "Type 1 — Overwrite. Changed columns are updated in place. Previous values are lost. Adds: _scd_action"}
//             {node.type === "scd2" && "Type 2 — Full history. Changed rows spawn a new current row + an expired old row with dates. Adds: surrogate_key, _scd_start_date, _scd_end_date, _scd_is_current, _scd_action"}
//             {node.type === "scd3" && "Type 3 — Previous value columns. Adds _prev_<column> for each tracked column. One level of history. Adds: _prev_*, _scd_action, _scd_change_date"}
//           </div>

//           {/* Snapshot source — picks from any existing Source node in the pipeline */}
//           <Field label="Snapshot source (previous state)">
//             <select
//               className={selectCls}
//               value={cfg.snapshotNodeId || ""}
//               onChange={(e) => {
//                 const selectedNode = allNodes.find((n) => n.id === e.target.value);
//                 onChange({
//                   snapshotNodeId: e.target.value,
//                   snapshotRows: selectedNode?.config?.rows || [],
//                   snapshotHeaders: selectedNode?.config?.headers || [],
//                 });
//               }}
//             >
//               <option value="">Select a Source node as snapshot…</option>
//               {allNodes
//                 .filter((n) => n.type === "source" && n.id !== node.id && (n.config?.rows?.length || n.config?.connectionId))
//                 .map((n) => (
//                   <option key={n.id} value={n.id}>
//                     {n.config?.fileName || n.config?.connectionName || n.id} ({(n.config?.rows?.length || 0)} rows)
//                   </option>
//                 ))}
//             </select>
//             <p className="text-[11px] text-[#9AA1B2] mt-1">
//               Add a second Source node with the previous snapshot data, then select it here.
//               Works with any table — CSV, Postgres, MySQL, Sheets.
//             </p>
//           </Field>

//           {cfg.snapshotRows?.length > 0 && (
//             <div className="text-[11px] text-emerald-600 bg-emerald-50 rounded px-2.5 py-1.5 mb-2">
//               ✓ {cfg.snapshotRows.length} snapshot rows loaded from selected source
//             </div>
//           )}

//           <Field label="Business key column">
//             <select className={selectCls} value={cfg.keyColumn || ""} onChange={(e) => onChange({ keyColumn: e.target.value })}>
//               <option value="">Select key column…</option>
//               {headers.map((h) => <option key={h} value={h}>{h}</option>)}
//             </select>
//           </Field>

//           {node.type === "scd2" && (
//             <Field label="Surrogate key column name">
//               <input
//                 className={selectCls}
//                 value={cfg.surrogateColumn || "surrogate_key"}
//                 onChange={(e) => onChange({ surrogateColumn: e.target.value })}
//                 placeholder="surrogate_key"
//               />
//             </Field>
//           )}

//           <Field label="Tracked columns (compare for changes)">
//             <div className="space-y-1.5 max-h-48 overflow-y-auto">
//               {headers.filter((h) => h !== cfg.keyColumn).map((h) => {
//                 const checked = (cfg.compareColumns || []).includes(h);
//                 return (
//                   <label key={h} className="flex items-center gap-2 text-[12px] cursor-pointer hover:text-[#1A2233]">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={() => {
//                         const current: string[] = cfg.compareColumns || [];
//                         onChange({
//                           compareColumns: checked
//                             ? current.filter((c: string) => c !== h)
//                             : [...current, h],
//                         });
//                       }}
//                     />
//                     <span className="font-mono">{h}</span>
//                   </label>
//                 );
//               })}
//               {headers.length === 0 && (
//                 <p className="text-[11px] text-[#9AA1B2]">Attach a Source node first to see available columns.</p>
//               )}
//             </div>
//             {(cfg.compareColumns || []).length > 0 && (
//               <p className="text-[11px] text-[#9AA1B2] mt-1">
//                 Tracking: {(cfg.compareColumns as string[]).join(", ")}
//               </p>
//             )}
//           </Field>

//           <div className="mt-2 pt-2.5 border-t border-[#E3E7EF] text-[11px] text-[#9AA1B2] leading-relaxed">
//             <strong className="text-[#6B7385]">How to use:</strong> Add two Source nodes —
//             one for current data, one for the snapshot. Wire both into this node by selecting
//             the snapshot above. The current data flows through automatically.
//             {node.type === "scd2" && " Filter to _scd_action ≠ NOCHANGE downstream to see only changed rows."}
//           </div>
//         </>
//       )}

//       {node.type === "normalizer" && (
//         <>
//           <p className="text-[11px] text-[#6B7385] mb-2">Unpivot: turn repeating columns into rows.</p>
//           <Field label="Columns to unpivot (comma separated)"><input className={selectCls} placeholder="e.g. jan_sales, feb_sales, mar_sales" value={(cfg.pivotColumns || []).join(", ")} onChange={(e) => onChange({ pivotColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
//           <Field label="Columns to keep (comma separated)"><input className={selectCls} placeholder="e.g. customer_id, region" value={(cfg.keepColumns || []).join(", ")} onChange={(e) => onChange({ keepColumns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
//           <Field label="Name column"><input className={selectCls} value={cfg.nameColumn || ""} onChange={(e) => onChange({ nameColumn: e.target.value })} /></Field>
//           <Field label="Value column"><input className={selectCls} value={cfg.valueColumn || ""} onChange={(e) => onChange({ valueColumn: e.target.value })} /></Field>
//         </>
//       )}

//   {node.type === "target" && (
//         <>
//           <Field label="Destination">
//             <div className="flex gap-1.5 mb-2">
//               <button onClick={() => onChange({ mode: "preview" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode !== "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Preview only</button>
//               <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded border ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Write to DB</button>
//             </div>
//           </Field>
//           {cfg.mode === "connection" ? (
//             <>
//               <Field label="Connection (Postgres / MySQL only)">
//                 <select
//                   className={selectCls}
//                   value={cfg.connectionId || ""}
//                   onChange={(e) => {
//                     const c = connections.find((x) => x._id === e.target.value);
//                     onChange({ connectionId: e.target.value, connectionName: c?.name || "" });
//                   }}
//                 >
//                   <option value="">Select a connection…</option>
//                   {connections.filter((c) => c.type === "postgres" || c.type === "mysql").map((c) => (
//                     <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
//                   ))}
//                 </select>
//                 {connections.filter((c) => c.type === "postgres" || c.type === "mysql").length === 0 && (
//                   <p className="text-[11px] text-[#6B7385] mt-1.5">No Postgres/MySQL connections yet — add one on the Connections page.</p>
//                 )}
//               </Field>
//               <Field label="Target table">
//                 <input className={selectCls} value={cfg.table || ""} onChange={(e) => onChange({ table: e.target.value })} placeholder="e.g. customers_clean" />
//               </Field>
//               <Field label="Write mode">
//                 <select className={selectCls} value={cfg.writeMode || "insert"} onChange={(e) => onChange({ writeMode: e.target.value })}>
//                   <option value="insert">Insert (append rows)</option>
//                   <option value="truncate_insert">Truncate table, then insert</option>
//                 </select>
//               </Field>
//               <p className="text-[11px] text-[#6B7385] leading-relaxed">The table must already exist with matching column names — this writes rows into it, it doesn't create the table.</p>
//             </>
//           ) : (
//             <p className="text-[11px] text-[#6B7385]">Run the pipeline to preview output, or export it as CSV/JSON from the preview panel. No database write happens in this mode.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


/*------DesignerCanvas — full rewrite with manual wiring, port dots, improved UI */
"use client";

import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { Undo2, Redo2, Save, Play, ChevronLeft } from "lucide-react";
import type { PipelineNode, RunLogStep } from "@/lib/transforms";

import DataProfileModal from "@/components/DataProfileModal";
import AiSuggestModal from "@/components/AiSuggestModal";
import AiGeneratePipelineModal from "@/components/AiGeneratePipelineModal";
import CopilotChat, { CopilotOperation } from "@/components/CopilotChat";
import { TRANSFORM_LABELS, TransformType } from "@/lib/transforms";
import { Edge, autoWire } from "@/lib/graphUtils";
import VersionHistoryPanel from "@/components/VersionHistoryPanel";
import { History } from "lucide-react";
type Row = Record<string, any>;

const TRANSFORM_GROUPS: { title: string; types: TransformType[] }[] = [
  { title: "Source", types: ["source"] },
  { title: "Row & Column Ops", types: ["filter", "rename", "dedupe", "nulls", "expression"] },
  { title: "Generate", types: ["sequence"] },
  { title: "Sort & Aggregate", types: ["sorter", "rank", "aggregator"] },
  { title: "Multi-source", types: ["router", "union", "joiner", "lookup", "updateStrategy"] },
  { title: "Restructure", types: ["normalizer"] },
  { title: "Target", types: ["target"] },
  { title: "SCD", types: ["scd1", "scd2", "scd3"] as TransformType[] },
];

function colorFor(type: TransformType) {
  if (type === "source") return "blue";
  if (type === "target") return "green";
  if (["router", "union", "joiner", "lookup", "updateStrategy"].includes(type)) return "amber";
  if (["scd1", "scd2", "scd3"].includes(type)) return "purple";
  return "violet";
}
function borderTopFor(type: TransformType) {
  const c = colorFor(type);
  return c === "blue" ? "#3B82F6" : c === "green" ? "#10B981" : c === "amber" ? "#F59E0B" : c === "purple" ? "#8B5CF6" : "#7C6AE8";
}
function dotClassFor(type: TransformType) {
  const c = colorFor(type);
  return c === "blue" ? "bg-blue-500" : c === "green" ? "bg-emerald-500" : c === "amber" ? "bg-amber-500" : c === "purple" ? "bg-purple-500" : "bg-violet-500";
}

function defaultConfig(type: TransformType, headers: string[]): Record<string, any> {
  switch (type) {
    case "source": return { mode: "upload", fileName: "", rows: [], headers: [], connectionId: "", connectionName: "" };
    case "filter": return { column: headers[0] || "", op: "not_empty", value: "" };
    case "rename": return { from: headers[0] || "", to: "" };
    case "nulls": return { column: headers[0] || "", strategy: "drop_row" };
    case "expression": return { outputPorts: [{ name: "", expr: "" }], variablePorts: [], inputMacros: [], outputMacros: [], _tab: "output" };
    case "sequence": return { outputColumn: "seq_id", startAt: 1, step: 1 };
    case "sorter": return { column: headers[0] || "", direction: "asc" };
    case "rank": return { column: headers[0] || "", outputColumn: "rank", direction: "desc" };
    case "aggregator": return { groupBy: headers[0] || "", targetColumn: headers[0] || "", fn: "sum" };
    case "router": return { column: headers[0] || "", routes: [] };
    case "union": return { referenceRows: [], referenceFileName: "" };
    case "joiner": return { referenceRows: [], leftKey: headers[0] || "", rightKey: "", joinType: "inner", referenceFileName: "" };
    case "lookup": return { referenceRows: [], key: headers[0] || "", lookupKey: "", copyColumns: [], referenceFileName: "" };
    case "updateStrategy": return { referenceRows: [], key: headers[0] || "", referenceFileName: "" };
    case "normalizer": return { pivotColumns: [], nameColumn: "field", valueColumn: "value", keepColumns: [] };
    case "target": return { mode: "preview", connectionId: "", connectionName: "", table: "", writeMode: "insert" };
    case "scd1": return { keyColumn: "", compareColumns: [], snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
    case "scd2": return { keyColumn: "", compareColumns: [], surrogateColumn: "surrogate_key", snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
    case "scd3": return { keyColumn: "", compareColumns: [], snapshotNodeId: "", snapshotRows: [], snapshotHeaders: [] };
    default: return {};
  }
}

export default function DesignerCanvas({ pipelineId, initialPipeline }: { pipelineId: string; initialPipeline?: any }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(initialPipeline?.name || "Untitled pipeline");
  const [environment, setEnvironment] = useState(initialPipeline?.environment || "DEV");
  const [headers, setHeaders] = useState<string[]>(initialPipeline?.headers || []);
  const [nodes, setNodes] = useState<PipelineNode[]>(initialPipeline?.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(
    initialPipeline?.edges?.length ? initialPipeline.edges : autoWire(initialPipeline?.nodes || [])
  );
  const [history, setHistory] = useState<PipelineNode[][]>([]);
  const [redoStack, setRedoStack] = useState<PipelineNode[][]>([]);
  const [promotedFrom] = useState<string | null>(initialPipeline?.promotedFrom || null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [log, setLog] = useState<RunLogStep[]>([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggingWire, setDraggingWire] = useState<{ fromNodeId: string; fromX: number; fromY: number; mouseX: number; mouseY: number } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; side: "in" | "out" } | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
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
  const [showHistory, setShowHistory] = useState(false);
  const counter = useRef(0);
  const dragState = useRef<{ id: string; ox: number; oy: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    fetch("/api/connections").then(r => r.json()).then(d => setConnections(d.connections || [])).catch(() => {});
  }, []);

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  }

  function pushHistory(pre: PipelineNode[]) {
    setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(pre))]);
    setRedoStack([]);
  }

  function undo() {
    setHistory(h => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setRedoStack(r => [...r, JSON.parse(JSON.stringify(nodes))]);
      setNodes(prev); setSelectedId(null);
      return h.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack(r => {
      if (!r.length) return r;
      const next = r[r.length - 1];
      setHistory(h => [...h, JSON.parse(JSON.stringify(nodes))]);
      setNodes(next); setSelectedId(null);
      return r.slice(0, -1);
    });
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if (meta && e.key.toLowerCase() === "s") { e.preventDefault(); savePipeline(); }
      if (e.key === "Escape") { setDraggingWire(null); setSelectedEdgeId(null); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEdgeId && document.activeElement === document.body) {
        setEdges(prev => prev.filter(e => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nodes, selectedEdgeId]);

  function addNode(type: TransformType) {
    pushHistory(nodes);
    counter.current += 1;
    const idx = nodes.length;
    const node: PipelineNode = {
      id: `n${counter.current}_${Date.now()}`,
      type, label: TRANSFORM_LABELS[type],
      x: 60 + (idx % 4) * 240,
      y: 60 + Math.floor(idx / 4) * 160,
      config: defaultConfig(type, headers),
    };
    setNodes(prev => [...prev, node]);
    setSelectedId(node.id);
  }

  function addSuggestedNodes(suggestions: { type: TransformType; config: Record<string, any> }[]) {
    pushHistory(nodes);
    setNodes(prev => {
      const startIdx = prev.length;
      const added = suggestions.map((s, i) => {
        counter.current += 1;
        const idx = startIdx + i;
        return { id: `n${counter.current}_${Date.now()}_${i}`, type: s.type, label: TRANSFORM_LABELS[s.type], x: 60 + (idx % 4) * 240, y: 60 + Math.floor(idx / 4) * 160, config: { ...defaultConfig(s.type, headers), ...s.config } };
      });
      return [...prev, ...added];
    });
    toast(`Added ${suggestions.length} suggested step${suggestions.length !== 1 ? "s" : ""}`);
  }

  function applyGeneratedPipeline(steps: { type: TransformType; config: Record<string, any> }[]) {
    pushHistory(nodes);
    setNodes(prev => {
      const sourceNodes = prev.filter(n => n.type === "source");
      const generated = steps.map((s, i) => {
        counter.current += 1;
        const idx = sourceNodes.length + i;
        return { id: `n${counter.current}_${Date.now()}_${i}`, type: s.type, label: TRANSFORM_LABELS[s.type], x: 60 + (idx % 4) * 240, y: 60 + Math.floor(idx / 4) * 160, config: { ...defaultConfig(s.type, headers), ...s.config } };
      });
      return [...sourceNodes, ...generated];
    });
    setSelectedId(null);
    toast(`Generated a ${steps.length}-step pipeline`);
  }

  function applyCopilotOperations(ops: CopilotOperation[]) {
    pushHistory(nodes);
    setNodes(prev => {
      let current = [...prev];
      for (const op of ops) {
        if (op.op === "add" && op.type) {
          counter.current += 1;
          const idx = current.length;
          current.push({ id: `n${counter.current}_${Date.now()}`, type: op.type, label: TRANSFORM_LABELS[op.type], x: 60 + (idx % 4) * 240, y: 60 + Math.floor(idx / 4) * 160, config: { ...defaultConfig(op.type, headers), ...op.config } });
        } else if (op.op === "remove" && op.nodeId) {
          current = current.filter(n => n.id !== op.nodeId);
        } else if (op.op === "update" && op.nodeId) {
          current = current.map(n => n.id === op.nodeId ? { ...n, config: { ...n.config, ...op.config } } : n);
        }
      }
      return current;
    });
    toast(`Applied ${ops.length} change${ops.length !== 1 ? "s" : ""} from copilot`);
  }

  function updateNodeConfig(id: string, patch: Record<string, any>) {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, config: { ...n.config, ...patch } } : n));
  }

  function removeNode(id: string) {
    pushHistory(nodes);
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function onNodeMouseDown(e: React.MouseEvent, node: PipelineNode) {
    if ((e.target as HTMLElement).closest("[data-port]")) return;
    const nodeId = node.id;
    const startX = e.clientX, startY = e.clientY, ox = node.x, oy = node.y;
    dragState.current = { id: nodeId, startX, startY, ox, oy };
    function onMove(ev: MouseEvent) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: Math.max(0, ox + ev.clientX - startX), y: Math.max(0, oy + ev.clientY - startY) } : n));
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
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const parsedHeaders = res.meta.fields || [];
        updateNodeConfig(nodeId, { mode: "upload", rows: res.data, headers: parsedHeaders, fileName: file.name, connectionId: "", connectionName: "" });
        setHeaders(parsedHeaders);
        toast(`${file.name} — ${(res.data as any[]).length} rows loaded`);
      },
    });
  }

  async function handleSourceConnection(nodeId: string, connectionId: string) {
    const conn = connections.find(c => c._id === connectionId);
    if (!conn) return;
    toast("Fetching sample from " + conn.name + "…");
    const res = await fetch(`/api/connections/${connectionId}/test`, { method: "POST" });
    const data = await res.json();
    if (data.testResult?.ok) {
      updateNodeConfig(nodeId, { mode: "connection", connectionId, connectionName: conn.name, rows: [], sampleRows: data.testResult.rows || [], headers: data.testResult.headers, fileName: "" });
      setHeaders(data.testResult.headers || []);
      toast(`Connected — ${data.testResult.headers?.length || 0} columns`);
    } else {
      toast("Connection test failed: " + (data.testResult?.error || data.error));
    }
  }

  function handleReferenceUpload(nodeId: string, file: File) {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        updateNodeConfig(nodeId, { referenceRows: res.data, referenceHeaders: res.meta.fields || [], referenceFileName: file.name });
      },
    });
  }

  async function savePipeline() {
    setSaving(true);
    const payload = { name, environment, headers, nodes, edges };
    if (savedId) {
      const res = await fetch(`/api/pipelines/${savedId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setSaving(false);
      if (res.ok) toast("Pipeline saved");
      return savedId;
    } else {
      const res = await fetch("/api/pipelines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setSaving(false);
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
    if (!savedId) { toast("Save first before promoting"); return; }
    const target = NEXT_ENV[environment];
    if (!target) { toast("PROD is the top — nothing to promote to"); return; }
    setPromoting(true);
    const res = await fetch(`/api/pipelines/${savedId}/promote`, { method: "POST" });
    const data = await res.json();
    setPromoting(false);
    if (res.ok) toast(data.wasUpdate ? `Re-promoted to ${target}` : `Promoted to ${target}`);
    else toast("Promote failed: " + data.error);
  }

  async function runPipelineNow() {
    const hasSource = nodes.some(n => n.type === "source" && (n.config?.rows?.length || n.config?.connectionId));
    if (!hasSource) { toast("Add a Source node with a CSV or connection first"); return; }
    const idToUse = savedId || (await savePipeline());
    if (!idToUse) return;
    setRunning(true); setLog([]);
    const res = await fetch(`/api/pipelines/${idToUse}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json();
    setLog(data.steps || []);
    setPreview({ rows: data.rows || [], headers: data.headers || headers });
    setRunning(false);
    toast(data.status === "success" ? "✓ Pipeline finished successfully" : "Pipeline finished with errors");
  }

  const selected = nodes.find(n => n.id === selectedId) || null;
  const paletteW = paletteCollapsed ? 52 : 220;
  const inspectorW = 300;

  return (
    <div className="flex flex-col h-screen bg-[#F4F6FA] overflow-hidden">

      {/* TOP BAR */}
      <div className="h-12 bg-white border-b border-[#E3E7EF] flex items-center px-4 gap-3 flex-shrink-0 z-30">
        <button onClick={() => router.push("/dashboard/pipelines")} className="flex items-center gap-1 text-[#6B7385] hover:text-[#1A2233] text-xs mr-1">
          <ChevronLeft size={14} /> Pipelines
        </button>
        <div className="w-px h-5 bg-[#E3E7EF]" />
        <input
          className="text-sm font-semibold text-[#1A2233] bg-transparent border-none outline-none w-52"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Pipeline name"
        />
        <select className="text-xs border border-[#E3E7EF] rounded-md px-2 py-1 bg-white text-[#6B7385]" value={environment} onChange={e => setEnvironment(e.target.value)}>
          <option>DEV</option><option>SIT</option><option>PROD</option>
        </select>

        <div className="flex items-center gap-1 ml-1">
          <button onClick={undo} disabled={!history.length} title="Undo (⌘Z)" className="w-7 h-7 flex items-center justify-center rounded border border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30">
            <Undo2 size={13} />
          </button>
          <button onClick={redo} disabled={!redoStack.length} title="Redo (⌘⇧Z)" className="w-7 h-7 flex items-center justify-center rounded border border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-30">
            <Redo2 size={13} />
          </button>
        </div>

        <div className="flex-1" />

        {promotedFrom && (
          <button onClick={() => router.push(`/dashboard/pipelines/diff/${savedId}`)} className="text-xs border border-[#E3E7EF] text-[#6B7385] rounded-lg px-3 py-1.5 hover:border-[#2F6FED] hover:text-[#2F6FED]">
            View diff →
          </button>
        )}
        <button onClick={() => {
          const hasSource = nodes.some(n => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
          if (!hasSource) { toast("Add a Source node with data first"); return; }
          setShowGenerateModal(true);
        }} className="text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] rounded-lg px-3 py-1.5 hover:bg-[#7C6AE810] flex items-center gap-1.5">
          ✨ AI Generate
        </button>
        <button onClick={() => setShowCopilot(v => !v)} className={`text-xs font-semibold border rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors ${showCopilot ? "border-[#7C6AE8] bg-[#7C6AE8] text-white" : "border-[#7C6AE8] text-[#7C6AE8] hover:bg-[#7C6AE810]"}`}>
          💬 Copilot
        </button>
        {environment !== "PROD" && (
          <button onClick={promotePipeline} disabled={promoting} className="text-xs font-semibold border border-[#D98A1E] text-[#D98A1E] rounded-lg px-3 py-1.5 hover:bg-[#D98A1E10] disabled:opacity-50">
            {promoting ? "Promoting…" : `→ ${NEXT_ENV[environment]}`}
          </button>
        )}
          <button onClick={() => setShowHistory(v => !v)}
          className={`text-xs font-semibold border rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors ${showHistory ? "border-[#7C6AE8] bg-[#7C6AE8] text-white" : "border-[#7C6AE8] text-[#7C6AE8] hover:bg-[#7C6AE810]"}`}>
          <History size={12} /> History
        </button>
        <button onClick={savePipeline} disabled={saving} className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3 py-1.5 hover:border-[#2F6FED] flex items-center gap-1.5 disabled:opacity-50">
          <Save size={12} /> {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={runPipelineNow} disabled={running} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-4 py-1.5 hover:bg-[#245BD1] disabled:opacity-50 flex items-center gap-1.5">
          <Play size={12} /> {running ? "Running…" : "Run pipeline"}
        </button>
      </div>

      {/* MAIN BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* PALETTE */}
        <div className="bg-white border-r border-[#E3E7EF] flex flex-col overflow-hidden flex-shrink-0 transition-all duration-200" style={{ width: paletteW }}>
          <button onClick={() => setPaletteCollapsed(v => !v)} className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B7385] hover:text-[#2F6FED] border-b border-[#E3E7EF] py-2 px-3">
            {paletteCollapsed ? "»" : <><span className="font-medium">Transforms</span> <span className="ml-auto">«</span></>}
          </button>

          <div className="overflow-y-auto flex-1 p-2">
            {paletteCollapsed ? (
              <div className="flex flex-col items-center gap-1.5 mt-1">
                {TRANSFORM_GROUPS.flatMap(g => g.types).map(t => (
                  <button key={t} onClick={() => addNode(t)} title={TRANSFORM_LABELS[t]} className="w-8 h-8 rounded-lg border border-[#E3E7EF] flex items-center justify-center hover:border-[#2F6FED] hover:bg-[#2F6FED08]">
                    <span className={`w-2 h-2 rounded-sm ${dotClassFor(t)}`} />
                  </button>
                ))}
              </div>
            ) : (
              <>
                {TRANSFORM_GROUPS.map(g => (
                  <div key={g.title} className="mb-1">
                    <div className="text-[9.5px] font-semibold uppercase tracking-wider text-[#9AA1B2] px-1.5 pt-3 pb-1.5">{g.title}</div>
                    {g.types.map(t => (
                      <button key={t} onClick={() => addNode(t)} className="w-full flex items-center gap-2 text-[12.5px] font-medium bg-[#FAFBFD] border border-[#E3E7EF] rounded-lg px-2.5 py-2 mb-1 hover:border-[#2F6FED] hover:bg-[#2F6FED08] text-left transition-colors">
                        <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${dotClassFor(t)}`} />
                        <span className="truncate">{TRANSFORM_LABELS[t]}</span>
                        <span className="ml-auto text-[#C5CADE] text-sm">+</span>
                      </button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* CANVAS */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto"
          style={{ backgroundImage: "radial-gradient(circle, #D1D5E0 1px, transparent 1px)", backgroundSize: "24px 24px", backgroundColor: "#F4F6FA" }}
          onMouseMove={e => {
            if (!draggingWire) return;
            const rect = canvasRef.current!.getBoundingClientRect();
            const scrollLeft = canvasRef.current!.scrollLeft;
            const scrollTop = canvasRef.current!.scrollTop;
            setDraggingWire(prev => prev ? { ...prev, mouseX: e.clientX - rect.left + scrollLeft, mouseY: e.clientY - rect.top + scrollTop } : null);
          }}
          onMouseUp={e => {
            if (draggingWire && hoveredPort?.side === "in" && hoveredPort.nodeId !== draggingWire.fromNodeId) {
              const newEdge: Edge = { id: `edge_${draggingWire.fromNodeId}_${hoveredPort.nodeId}_${Date.now()}`, from: draggingWire.fromNodeId, to: hoveredPort.nodeId };
              setEdges(prev => [...prev.filter(e => !(e.from === newEdge.from && e.to === newEdge.to)), newEdge]);
            }
            setDraggingWire(null);
            setHoveredPort(null);
          }}
          onClick={() => { setSelectedEdgeId(null); }}
        >
          <div className="relative" style={{ width: 1600, height: 1100 }}>

            {/* SVG WIRES */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none", zIndex: 1 }}>
              <defs>
                <marker id="arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                  <polygon points="0 0, 7 2.5, 0 5" fill="#2F6FED" opacity="0.8" />
                </marker>
                <marker id="arrowSelected" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                  <polygon points="0 0, 7 2.5, 0 5" fill="#2F6FED" />
                </marker>
              </defs>

              {edges.map(edge => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const x1 = fromNode.x + 200, y1 = fromNode.y + 40;
                const x2 = toNode.x, y2 = toNode.y + 40;
                const mx = (x1 + x2) / 2;
                const isSelected = selectedEdgeId === edge.id;
                return (
                  <g key={edge.id} style={{ pointerEvents: "auto" }}>
                    {/* fat transparent hit area */}
                    <path d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`} fill="none" stroke="transparent" strokeWidth={14} className="cursor-pointer"
                      onClick={ev => { ev.stopPropagation(); setSelectedEdgeId(isSelected ? null : edge.id); }} />
                    {/* visible wire */}
                    <path d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`} fill="none"
                      stroke={isSelected ? "#2F6FED" : "#2F6FED"} strokeWidth={isSelected ? 2 : 1.5}
                      opacity={isSelected ? 1 : 0.5} markerEnd={isSelected ? "url(#arrowSelected)" : "url(#arrow)"}
                      strokeDasharray={isSelected ? "none" : "none"} />
                    {/* delete button on selected */}
                    {isSelected && (() => {
                      const bx = mx, by = (y1 + y2) / 2;
                      return (
                        <g transform={`translate(${bx}, ${by})`} className="cursor-pointer"
                          onClick={ev => { ev.stopPropagation(); setEdges(prev => prev.filter(e => e.id !== edge.id)); setSelectedEdgeId(null); }}>
                          <circle r="10" fill="white" stroke="#2F6FED" strokeWidth="1.5" />
                          <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#2F6FED" fontFamily="monospace">×</text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* dragging wire preview */}
              {draggingWire && (
                <path
                  d={`M ${draggingWire.fromX} ${draggingWire.fromY} C ${(draggingWire.fromX + draggingWire.mouseX) / 2} ${draggingWire.fromY} ${(draggingWire.fromX + draggingWire.mouseX) / 2} ${draggingWire.mouseY} ${draggingWire.mouseX} ${draggingWire.mouseY}`}
                  fill="none" stroke="#2F6FED" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7}
                />
              )}
            </svg>

            {/* EMPTY STATE */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-[#D1D5E0] flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-[#C5CADE]">⇢</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#1A2233] mb-1.5">Start building your pipeline</h3>
                  <p className="text-[12.5px] text-[#9AA1B2] leading-relaxed max-w-[280px]">
                    Add a <strong>Source</strong> from the left panel, then chain transforms, then finish with a <strong>Target</strong>.
                    <br /><br />
                    Drag from the <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 align-middle mx-0.5" /> green dot → <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 align-middle mx-0.5" /> blue dot to connect nodes.
                  </p>
                </div>
              </div>
            )}

            {/* NODE CARDS */}
            {nodes.map((n, i) => {
              const isSelected = n.id === selectedId;
              const borderTop = borderTopFor(n.type);
              const entry = log.find(l => l.nodeId === n.id);

              return (
                <div
                  key={n.id}
                  onMouseDown={e => { onNodeMouseDown(e, n); setSelectedId(n.id); setSelectedEdgeId(null); }}
                  className="absolute select-none"
                  style={{ left: n.x, top: n.y, zIndex: isSelected ? 10 : 2 }}
                >
                  {/* INPUT PORT — left, blue */}
                  {n.type !== "source" && (
                    <div
                      data-port="in"
                      className="absolute flex items-center justify-center cursor-crosshair"
                      style={{
                        left: -10, top: "50%", transform: "translateY(-50%)",
                        width: 20, height: 20, borderRadius: "50%",
                        background: "white", border: "2px solid #2F6FED", zIndex: 20,
                        boxShadow: hoveredPort?.nodeId === n.id && hoveredPort.side === "in"
                          ? "0 0 0 4px #2F6FED33, 0 0 0 1px #2F6FED" : "0 1px 3px rgba(0,0,0,0.15)",
                        transition: "box-shadow 0.15s",
                      }}
                      onMouseEnter={() => setHoveredPort({ nodeId: n.id, side: "in" })}
                      onMouseLeave={() => setHoveredPort(null)}
                      onMouseUp={e => {
                        e.stopPropagation();
                        if (draggingWire && draggingWire.fromNodeId !== n.id) {
                          const newEdge: Edge = { id: `edge_${draggingWire.fromNodeId}_${n.id}_${Date.now()}`, from: draggingWire.fromNodeId, to: n.id };
                          setEdges(prev => [...prev.filter(e => !(e.from === newEdge.from && e.to === newEdge.to)), newEdge]);
                          setDraggingWire(null); setHoveredPort(null);
                        }
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2F6FED" }} />
                    </div>
                  )}

                  {/* OUTPUT PORT — right, green */}
                  {n.type !== "target" && (
                    <div
                      data-port="out"
                      className="absolute flex items-center justify-center cursor-crosshair"
                      style={{
                        right: -10, top: "50%", transform: "translateY(-50%)",
                        width: 20, height: 20, borderRadius: "50%",
                        background: "white", border: "2px solid #10B981", zIndex: 20,
                        boxShadow: hoveredPort?.nodeId === n.id && hoveredPort.side === "out"
                          ? "0 0 0 4px #10B98133, 0 0 0 1px #10B981" : "0 1px 3px rgba(0,0,0,0.15)",
                        transition: "box-shadow 0.15s",
                      }}
                      onMouseEnter={() => setHoveredPort({ nodeId: n.id, side: "out" })}
                      onMouseLeave={() => setHoveredPort(null)}
                      onMouseDown={e => {
                        e.stopPropagation();
                        const rect = canvasRef.current!.getBoundingClientRect();
                        const scrollLeft = canvasRef.current!.scrollLeft;
                        const scrollTop = canvasRef.current!.scrollTop;
                        setDraggingWire({ fromNodeId: n.id, fromX: n.x + 200, fromY: n.y + 40, mouseX: e.clientX - rect.left + scrollLeft, mouseY: e.clientY - rect.top + scrollTop });
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                    </div>
                  )}

                  {/* CARD */}
                  <div
                    className="bg-white rounded-xl cursor-grab active:cursor-grabbing"
                    style={{
                      width: 200,
                      borderLeft: isSelected ? "1.5px solid #2F6FED" : "1.5px solid #E3E7EF",
                      borderRight: isSelected ? "1.5px solid #2F6FED" : "1.5px solid #E3E7EF",
                      borderBottom: isSelected ? "1.5px solid #2F6FED" : "1.5px solid #E3E7EF",
                      borderTop: `3px solid ${borderTop}`,
                      boxShadow: isSelected
                        ? "0 0 0 3px #2F6FED18, 0 4px 12px rgba(0,0,0,0.08)"
                        : "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Card header */}
                    <div className="px-3 pt-2.5 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#1A2233] truncate">{n.label}</span>
                        <div className="flex items-center gap-1.5">
                          {entry ? (
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#E3E7EF] flex-shrink-0" />
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); removeNode(n.id); }}
                            className="w-4 h-4 rounded-full bg-[#F4F6FA] text-[#9AA1B2] hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-[10px] leading-none"
                          >×</button>
                        </div>
                      </div>
                      <div className="text-[9.5px] font-mono text-[#9AA1B2] mt-0.5 uppercase tracking-wide">step {i + 1} · {n.type}</div>
                    </div>

                    {/* Card body */}
                    <div className="px-3 pb-2.5 border-t border-[#F4F6FA]">
                      {n.type === "source" ? (
                        <div className="text-[10.5px] font-mono text-[#2F6FED] mt-1.5 truncate">
                          {n.config.connectionName || n.config.fileName || <span className="text-[#C5CADE]">not configured</span>}
                        </div>
                      ) : null}
                      <div className="text-[10.5px] text-[#9AA1B2] mt-1">
                        {entry ? `${entry.rowsOut} rows out` : <span className="text-[#C5CADE]">not yet run</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INSPECTOR */}
        <div className="bg-white border-l border-[#E3E7EF] flex flex-col overflow-hidden flex-shrink-0" style={{ width: inspectorW }}>
          {/* Inspector header */}
          <div className="border-b border-[#E3E7EF] px-4 py-2.5 flex-shrink-0">
            {selected ? (
              <div>
                <div className="text-[13.5px] font-semibold text-[#1A2233]">{selected.label}</div>
                <div className="text-[10.5px] font-mono text-[#9AA1B2] mt-0.5">{selected.type} · step config</div>
              </div>
            ) : (
              <div className="text-[12px] text-[#9AA1B2]">Select a node to configure</div>
            )}
          </div>

          {/* Inspector body */}
          <div className="flex-1 overflow-y-auto p-4">
            {selected ? (
              <NodeInspector
                node={selected}
                headers={headers}
                connections={connections}
                allNodes={nodes}
                onChange={patch => updateNodeConfig(selected.id, patch)}
                onReferenceUpload={file => handleReferenceUpload(selected.id, file)}
                onSourceUpload={file => handleSourceUpload(selected.id, file)}
                onSourceConnection={connId => handleSourceConnection(selected.id, connId)}
                onOpenProfile={nodeId => setProfileModalNodeId(nodeId)}
                onOpenAiSuggest={nodeId => setAiSuggestNodeId(nodeId)}
              />
            ) : (
              <div className="text-center mt-10">
                <div className="text-[11px] text-[#9AA1B2] leading-relaxed">
                  Click any node on the canvas to configure it here.
                  <br /><br />
                  <span className="text-[10.5px]">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 align-middle mr-1" />Green dot = output
                    <br />
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 align-middle mr-1 mt-1" />Blue dot = input
                    <br />
                    Drag green → blue to connect
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Execution log */}
          <div className="border-t border-[#E3E7EF] p-4 flex-shrink-0 max-h-52 overflow-y-auto">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9AA1B2] mb-2">Execution log</div>
            {log.length === 0 ? (
              <div className="text-[11px] text-[#C5CADE]">No runs yet.</div>
            ) : (
              <div className="space-y-1">
                {[...log].reverse().map((s, i) => (
                  <div key={i} className={`text-[10.5px] font-mono rounded px-2 py-1.5 border-l-2 ${s.ok ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-600"}`}>
                    <div className="font-semibold">{s.label}</div>
                    <div className="opacity-80">{s.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OUTPUT PREVIEW */}
      {preview && (
        <div className="fixed bottom-0 bg-white border-t border-[#E3E7EF] z-40 shadow-lg"
          style={{ left: paletteW, right: inspectorW }}>
          <div className="flex justify-between items-center px-4 py-2 border-b border-[#F0F2F6]">
            <h3 className="text-xs font-semibold">Output — {preview.rows.length} rows · showing {Math.min(25, preview.rows.length)}</h3>
            <div className="flex gap-2">
              <button onClick={() => downloadOutput(preview, "csv", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ CSV</button>
              <button onClick={() => downloadOutput(preview, "json", name)} className="text-xs font-semibold text-[#2F6FED] hover:underline">↓ JSON</button>
              <button onClick={() => setPreview(null)} className="text-xs border border-[#E3E7EF] rounded px-2 py-1 hover:border-[#2F6FED]">✕ Close</button>
            </div>
          </div>
          <div className="overflow-auto" style={{ maxHeight: 200 }}>
            <table className="text-xs w-full">
              <thead>
                <tr>{preview.headers.map((h, hi) => <th key={`${h}_${hi}`} className="text-left px-3 py-1.5 text-[#2F6FED] font-mono font-medium whitespace-nowrap bg-[#FAFBFD] border-b border-[#F0F2F6]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 25).map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "" : "bg-[#FAFBFD]"}>
                    {preview.headers.map((h, hi) => <td key={`${h}_${hi}`} className="px-3 py-1.5 text-[#6B7385] whitespace-nowrap">{String(r[h] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A2233] text-white text-xs px-4 py-2.5 rounded-lg z-50 shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* MODALS */}
      {profileModalNodeId && (() => {
        const profileNode = nodes.find(n => n.id === profileModalNodeId);
        if (!profileNode) return null;
        const isSample = profileNode.config.mode === "connection";
        const profileRows = isSample ? profileNode.config.sampleRows || [] : profileNode.config.rows || [];
        return <DataProfileModal rows={profileRows} headers={headers} isSample={isSample} onClose={() => setProfileModalNodeId(null)} />;
      })()}

      {aiSuggestNodeId && (() => {
        const srcNode = nodes.find(n => n.id === aiSuggestNodeId);
        if (!srcNode) return null;
        const isSample = srcNode.config.mode === "connection";
        const dataRows = isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || [];
        return <AiSuggestModal rows={dataRows} headers={headers} onAddNodes={addSuggestedNodes} onClose={() => setAiSuggestNodeId(null)} />;
      })()}

      {showGenerateModal && (() => {
        const srcNode = nodes.find(n => n.type === "source" && (n.config?.rows?.length || n.config?.sampleRows?.length));
        const isSample = srcNode?.config.mode === "connection";
        const dataRows = srcNode ? (isSample ? srcNode.config.sampleRows || [] : srcNode.config.rows || []) : [];
        return <AiGeneratePipelineModal rows={dataRows} headers={headers} hasExistingSteps={nodes.some(n => n.type !== "source")} onApply={applyGeneratedPipeline} onClose={() => setShowGenerateModal(false)} />;
      })()}
{/* 
      {showCopilot && <CopilotChat nodes={nodes} headers={headers} onApplyOperations={applyCopilotOperations} onClose={() => setShowCopilot(false)} />}
    </div>
  );
} */}
      {showCopilot && <CopilotChat nodes={nodes} headers={headers} onApplyOperations={applyCopilotOperations} onClose={() => setShowCopilot(false)} />}

      {showHistory && savedId && (
        <VersionHistoryPanel
          pipelineId={savedId}
          currentNodes={nodes}
          onRestore={(restoredNodes, restoredEdges, restoredHeaders) => {
            pushHistory(nodes);
            setNodes(restoredNodes);
            setEdges(restoredEdges);
            setHeaders(restoredHeaders);
            setShowHistory(false);
            toast("Pipeline restored to selected version");
          }}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function downloadOutput(preview: { rows: Row[]; headers: string[] }, format: "csv" | "json", pipelineName: string) {
  let content: string, mime: string, ext: string;
  if (format === "json") { content = JSON.stringify(preview.rows, null, 2); mime = "application/json"; ext = "json"; }
  else {
    const esc = (v: any) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    content = [preview.headers.join(","), ...preview.rows.map(r => preview.headers.map(h => esc(r[h])).join(","))].join("\n");
    mime = "text/csv"; ext = "csv";
  }
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([content], { type: mime })), download: `${pipelineName.replace(/\s+/g, "_")}_output.${ext}` });
  a.click(); URL.revokeObjectURL(a.href);
}

// ─── NodeInspector ──────────────────────────────────────────────────────────

function NodeInspector({ node, headers, connections, allNodes, onChange, onReferenceUpload, onSourceUpload, onSourceConnection, onOpenProfile, onOpenAiSuggest }: {
  node: PipelineNode; headers: string[]; connections: any[]; allNodes: PipelineNode[];
  onChange: (patch: Record<string, any>) => void;
  onReferenceUpload: (file: File) => void;
  onSourceUpload: (file: File) => void;
  onSourceConnection: (connectionId: string) => void;
  onOpenProfile: (nodeId: string) => void;
  onOpenAiSuggest: (nodeId: string) => void;
}) {
  const cfg = node.config || {};
  const selectCls = "w-full border border-[#E3E7EF] bg-[#FAFBFD] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2F6FED]";
  const labelCls = "block text-[10.5px] font-semibold text-[#6B7385] mb-1 uppercase tracking-wide";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-3.5"><label className={labelCls}>{label}</label>{children}</div>
  );
  const refUploader = (
    <Field label={cfg.referenceFileName ? `Reference: ${cfg.referenceFileName}` : "Reference CSV"}>
      <label className="block border border-dashed border-[#E3E7EF] rounded-lg px-2.5 py-2.5 text-[11px] text-center cursor-pointer hover:border-[#2F6FED] hover:bg-[#2F6FED08] transition-colors">
        {cfg.referenceFileName ? `✓ Replace file` : "Upload reference CSV"}
        <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onReferenceUpload(f); }} />
      </label>
    </Field>
  );
  const refHeaders: string[] = cfg.referenceHeaders || [];

  return (
    <div>
      {/* SOURCE */}
      {node.type === "source" && (
        <>
          <Field label="Source type">
            <div className="flex gap-1.5">
              <button onClick={() => onChange({ mode: "upload" })} className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${cfg.mode !== "connection" ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"}`}>CSV upload</button>
              <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"}`}>Connection</button>
            </div>
          </Field>
          {cfg.mode === "connection" ? (
            <Field label="Connection">
              <select className={selectCls} value={cfg.connectionId || ""} onChange={e => onSourceConnection(e.target.value)}>
                <option value="">Select a connection…</option>
                {connections.map(c => <option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}
              </select>
              {connections.length === 0 && <p className="text-[11px] text-[#9AA1B2] mt-1.5">No connections yet — add one on the Connections page.</p>}
            </Field>
          ) : (
            <Field label={cfg.fileName ? `File: ${cfg.fileName}` : "CSV file"}>
              <label className="block border border-dashed border-[#E3E7EF] rounded-lg px-2.5 py-4 text-[11px] text-center cursor-pointer hover:border-[#2F6FED] hover:bg-[#2F6FED08] transition-colors">
                {cfg.fileName ? `✓ ${cfg.rows?.length || 0} rows — replace file` : <span>Drop CSV here or <span className="text-[#2F6FED] font-semibold">browse</span></span>}
                <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onSourceUpload(f); }} />
              </label>
            </Field>
          )}
          {((cfg.mode !== "connection" && cfg.rows?.length) || (cfg.mode === "connection" && cfg.sampleRows?.length)) ? (
            <div className="flex gap-2">
              <button onClick={() => onOpenProfile(node.id)} className="flex-1 text-xs font-semibold border border-[#E3E7EF] rounded-lg py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]">📊 Profile</button>
              <button onClick={() => onOpenAiSuggest(node.id)} className="flex-1 text-xs font-semibold border border-[#7C6AE8] text-[#7C6AE8] rounded-lg py-2 hover:bg-[#7C6AE810]">✨ AI Suggest</button>
            </div>
          ) : null}
        </>
      )}

      {/* FILTER */}
      {node.type === "filter" && (
        <>
          <Field label="Column"><select className={selectCls} value={cfg.column} onChange={e => onChange({ column: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Condition">
            <select className={selectCls} value={cfg.op} onChange={e => onChange({ op: e.target.value })}>
              <option value="not_empty">Is not empty</option><option value="empty">Is empty</option>
              <option value="gt">Greater than</option><option value="lt">Less than</option>
              <option value="eq">Equals</option><option value="neq">Not equals</option><option value="contains">Contains</option>
            </select>
          </Field>
          {["gt", "lt", "eq", "neq", "contains"].includes(cfg.op) && (
            <Field label="Value"><input className={selectCls} value={cfg.value || ""} onChange={e => onChange({ value: e.target.value })} /></Field>
          )}
        </>
      )}

      {/* RENAME */}
      {node.type === "rename" && (
        <>
          <Field label="From column"><select className={selectCls} value={cfg.from} onChange={e => onChange({ from: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="New name"><input className={selectCls} value={cfg.to || ""} onChange={e => onChange({ to: e.target.value })} placeholder="e.g. customer_name" /></Field>
        </>
      )}

      {/* NULLS */}
      {node.type === "nulls" && (
        <>
          <Field label="Column"><select className={selectCls} value={cfg.column} onChange={e => onChange({ column: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Strategy">
            <select className={selectCls} value={cfg.strategy} onChange={e => onChange({ strategy: e.target.value })}>
              <option value="drop_row">Drop row</option><option value="fill_zero">Fill with 0</option><option value="fill_na">Fill with N/A</option>
            </select>
          </Field>
        </>
      )}

      {/* EXPRESSION */}
      {node.type === "expression" && (() => {
        const tab = cfg._tab || "output";
        const outputPorts: { name: string; expr: string }[] = cfg.outputPorts?.length ? cfg.outputPorts : cfg.columns?.length ? cfg.columns : cfg.name ? [{ name: cfg.name, expr: cfg.expr || "" }] : [{ name: "", expr: "" }];
        const variablePorts: { name: string; expr: string }[] = cfg.variablePorts || [];
        const inputMacros: { name: string; value: string; description?: string }[] = cfg.inputMacros || [];
        const outputMacros: { name: string; expr: string }[] = cfg.outputMacros || [];
        const tabs = [
          { key: "input", label: "Input ports", count: headers.length },
          { key: "output", label: "Output ports", count: outputPorts.filter(p => p.name).length },
          { key: "variable", label: "Variable ports", count: variablePorts.filter(p => p.name).length },
          { key: "imacro", label: "Input macros", count: inputMacros.filter(p => p.name).length },
          { key: "omacro", label: "Output macros", count: outputMacros.filter(p => p.name).length },
        ];
        return (
          <>
            <div className="flex gap-1 flex-wrap mb-3">
              {tabs.map(t => (
                <button key={t.key} onClick={() => onChange({ _tab: t.key })} className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${tab === t.key ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"}`}>
                  {t.label}{t.count > 0 && <span className="ml-1 text-[9px] bg-[#E3E7EF] text-[#6B7385] rounded-full px-1">{t.count}</span>}
                </button>
              ))}
            </div>
            {tab === "input" && (
              <div className="space-y-1">
                {headers.length === 0 && <p className="text-[11px] text-[#9AA1B2]">Attach a Source first.</p>}
                {headers.map(h => <div key={h} className="flex items-center gap-2 bg-[#FAFBFD] border border-[#E3E7EF] rounded px-2 py-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-[11px] font-mono">{h}</span><span className="ml-auto text-[10px] text-[#9AA1B2]">input</span></div>)}
              </div>
            )}
            {tab === "output" && (
              <div>
                <div className="space-y-2 mb-2">
                  {outputPorts.map((col, i) => (
                    <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-[#9AA1B2]">Output {i + 1}</span>
                        {outputPorts.length > 1 && <button onClick={() => onChange({ outputPorts: outputPorts.filter((_, ci) => ci !== i) })} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button>}
                      </div>
                      <input className={`${selectCls} mb-1`} value={col.name} placeholder="Column name" onChange={e => { const u = outputPorts.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c); onChange({ outputPorts: u }); }} />
                      <input className={`${selectCls} font-mono`} value={col.expr} placeholder="e.g. salary * 1.1" onChange={e => { const u = outputPorts.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c); onChange({ outputPorts: u }); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => onChange({ outputPorts: [...outputPorts, { name: "", expr: "" }] })} className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#2F6FED] hover:text-[#2F6FED]">+ Add output port</button>
              </div>
            )}
            {tab === "variable" && (
              <div>
                <div className="space-y-2 mb-2">
                  {variablePorts.map((col, i) => (
                    <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
                      <div className="flex justify-between mb-1.5"><span className="text-[10px] font-mono text-[#9AA1B2]">Variable {i + 1}</span><button onClick={() => onChange({ variablePorts: variablePorts.filter((_, ci) => ci !== i) })} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button></div>
                      <input className={`${selectCls} mb-1`} value={col.name} placeholder="Variable name" onChange={e => { const u = variablePorts.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c); onChange({ variablePorts: u }); }} />
                      <input className={`${selectCls} font-mono`} value={col.expr} placeholder="e.g. salary * 12" onChange={e => { const u = variablePorts.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c); onChange({ variablePorts: u }); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => onChange({ variablePorts: [...variablePorts, { name: "", expr: "" }] })} className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#D98A1E] hover:text-[#D98A1E]">+ Add variable port</button>
              </div>
            )}
            {tab === "imacro" && (
              <div>
                <div className="space-y-2 mb-2">
                  {inputMacros.map((m, i) => (
                    <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
                      <div className="flex justify-between mb-1.5"><span className="text-[10px] font-mono text-[#9AA1B2]">Macro {i + 1}</span><button onClick={() => onChange({ inputMacros: inputMacros.filter((_, ci) => ci !== i) })} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button></div>
                      <input className={`${selectCls} mb-1`} value={m.name} placeholder="Macro name" onChange={e => { const u = inputMacros.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c); onChange({ inputMacros: u }); }} />
                      <input className={selectCls} value={m.value} placeholder="Value" onChange={e => { const u = inputMacros.map((c, ci) => ci === i ? { ...c, value: e.target.value } : c); onChange({ inputMacros: u }); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => onChange({ inputMacros: [...inputMacros, { name: "", value: "" }] })} className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#7C6AE8] hover:text-[#7C6AE8]">+ Add input macro</button>
              </div>
            )}
            {tab === "omacro" && (
              <div>
                <div className="space-y-2 mb-2">
                  {outputMacros.map((col, i) => (
                    <div key={i} className="border border-[#E3E7EF] rounded-lg p-2.5 bg-[#FAFBFD]">
                      <div className="flex justify-between mb-1.5"><span className="text-[10px] font-mono text-[#9AA1B2]">Output macro {i + 1}</span><button onClick={() => onChange({ outputMacros: outputMacros.filter((_, ci) => ci !== i) })} className="text-[10px] text-[#9AA1B2] hover:text-red-500">✕</button></div>
                      <input className={`${selectCls} mb-1`} value={col.name} placeholder="Column name" onChange={e => { const u = outputMacros.map((c, ci) => ci === i ? { ...c, name: e.target.value } : c); onChange({ outputMacros: u }); }} />
                      <input className={`${selectCls} font-mono`} value={col.expr} placeholder="e.g. salary * TAX_RATE" onChange={e => { const u = outputMacros.map((c, ci) => ci === i ? { ...c, expr: e.target.value } : c); onChange({ outputMacros: u }); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => onChange({ outputMacros: [...outputMacros, { name: "", expr: "" }] })} className="w-full text-xs font-semibold border border-dashed border-[#E3E7EF] rounded-lg py-2 hover:border-[#DA4B4B] hover:text-[#DA4B4B]">+ Add output macro</button>
              </div>
            )}
          </>
        );
      })()}

      {/* SEQUENCE */}
      {node.type === "sequence" && (
        <>
          <Field label="Output column"><input className={selectCls} value={cfg.outputColumn || ""} onChange={e => onChange({ outputColumn: e.target.value })} placeholder="e.g. surrogate_key" /></Field>
          <Field label="Start at"><input type="number" className={selectCls} value={cfg.startAt ?? 1} onChange={e => onChange({ startAt: Number(e.target.value) })} /></Field>
          <Field label="Step"><input type="number" className={selectCls} value={cfg.step ?? 1} onChange={e => onChange({ step: Number(e.target.value) })} /></Field>
        </>
      )}

      {/* SORTER */}
      {node.type === "sorter" && (
        <>
          <Field label="Column"><select className={selectCls} value={cfg.column} onChange={e => onChange({ column: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={e => onChange({ direction: e.target.value })}><option value="asc">Ascending</option><option value="desc">Descending</option></select></Field>
        </>
      )}

      {/* RANK */}
      {node.type === "rank" && (
        <>
          <Field label="Rank by"><select className={selectCls} value={cfg.column} onChange={e => onChange({ column: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Output column"><input className={selectCls} value={cfg.outputColumn || ""} onChange={e => onChange({ outputColumn: e.target.value })} /></Field>
          <Field label="Direction"><select className={selectCls} value={cfg.direction} onChange={e => onChange({ direction: e.target.value })}><option value="desc">Highest = rank 1</option><option value="asc">Lowest = rank 1</option></select></Field>
        </>
      )}

      {/* AGGREGATOR */}
      {node.type === "aggregator" && (
        <>
          <Field label="Group by"><select className={selectCls} value={cfg.groupBy} onChange={e => onChange({ groupBy: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Target column"><select className={selectCls} value={cfg.targetColumn} onChange={e => onChange({ targetColumn: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Function"><select className={selectCls} value={cfg.fn} onChange={e => onChange({ fn: e.target.value })}><option value="sum">Sum</option><option value="avg">Average</option><option value="count">Count</option><option value="min">Min</option><option value="max">Max</option></select></Field>
        </>
      )}

      {/* ROUTER */}
      {node.type === "router" && (
        <>
          <Field label="Route by column"><select className={selectCls} value={cfg.column} onChange={e => onChange({ column: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          {(cfg.routes || []).map((rt: any, i: number) => (
            <div key={i} className="flex gap-1.5 mt-2">
              <input className="flex-1 border border-[#E3E7EF] rounded-lg px-2 py-1.5 text-xs" placeholder="route name" value={rt.name} onChange={e => { const r = [...cfg.routes]; r[i] = { ...r[i], name: e.target.value }; onChange({ routes: r }); }} />
              <input className="flex-1 border border-[#E3E7EF] rounded-lg px-2 py-1.5 text-xs" placeholder="matches value" value={rt.value} onChange={e => { const r = [...cfg.routes]; r[i] = { ...r[i], value: e.target.value }; onChange({ routes: r }); }} />
            </div>
          ))}
          <button className="text-xs text-[#2F6FED] mt-2 hover:underline" onClick={() => onChange({ routes: [...(cfg.routes || []), { name: "", value: "" }] })}>+ Add route</button>
        </>
      )}

      {node.type === "union" && <>{refUploader}</>}

      {/* JOINER */}
      {node.type === "joiner" && (
        <>{refUploader}
          <Field label="Left key"><select className={selectCls} value={cfg.leftKey} onChange={e => onChange({ leftKey: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Right key"><select className={selectCls} value={cfg.rightKey} onChange={e => onChange({ rightKey: e.target.value })}><option value="">Select after uploading reference…</option>{refHeaders.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Join type"><select className={selectCls} value={cfg.joinType} onChange={e => onChange({ joinType: e.target.value })}><option value="inner">Inner join</option><option value="left">Left join</option></select></Field>
        </>
      )}

      {/* LOOKUP */}
      {node.type === "lookup" && (
        <>{refUploader}
          <Field label="Key (this pipeline)"><select className={selectCls} value={cfg.key} onChange={e => onChange({ key: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Key (reference CSV)"><select className={selectCls} value={cfg.lookupKey} onChange={e => onChange({ lookupKey: e.target.value })}><option value="">Select after uploading…</option>{refHeaders.map(h => <option key={h}>{h}</option>)}</select></Field>
          <Field label="Columns to copy (comma separated)"><input className={selectCls} placeholder="e.g. price, category" value={(cfg.copyColumns || []).join(", ")} onChange={e => onChange({ copyColumns: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Field>
        </>
      )}

      {/* UPDATE STRATEGY */}
      {node.type === "updateStrategy" && (
        <>{refUploader}
          <Field label="Key column"><select className={selectCls} value={cfg.key} onChange={e => onChange({ key: e.target.value })}>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>
          <p className="text-[11px] text-[#9AA1B2]">Tags each row: INSERT / UPDATE / NOCHANGE / DELETE</p>
        </>
      )}

      {/* SCD 1/2/3 */}
      {(node.type === "scd1" || node.type === "scd2" || node.type === "scd3") && (
        <>
          <div className="text-[11px] text-[#6B7385] bg-[#F4F6FA] rounded-lg px-3 py-2 mb-3 leading-relaxed">
            {node.type === "scd1" && "Type 1 — Overwrite. Changed columns updated in place. Tags: INSERT | UPDATE | NOCHANGE"}
            {node.type === "scd2" && "Type 2 — Full history. Changed rows spawn new + expired rows with dates."}
            {node.type === "scd3" && "Type 3 — Previous value columns. Adds _prev_<column> for each tracked column."}
          </div>
          <Field label="Snapshot source (previous state)">
            <select className={selectCls} value={cfg.snapshotNodeId || ""} onChange={e => {
              const selectedNode = allNodes.find(n => n.id === e.target.value);
              onChange({ snapshotNodeId: e.target.value, snapshotRows: selectedNode?.config?.rows || [], snapshotHeaders: selectedNode?.config?.headers || [] });
            }}>
              <option value="">Select a Source node as snapshot…</option>
              {allNodes.filter(n => n.type === "source" && n.id !== node.id && (n.config?.rows?.length || n.config?.connectionId)).map(n => (
                <option key={n.id} value={n.id}>{n.config?.fileName || n.config?.connectionName || n.id} ({n.config?.rows?.length || 0} rows)</option>
              ))}
            </select>
            <p className="text-[11px] text-[#9AA1B2] mt-1">Add a 2nd Source node with snapshot data, then select it above.</p>
          </Field>
          {cfg.snapshotRows?.length > 0 && <div className="text-[11px] text-emerald-600 bg-emerald-50 rounded px-2.5 py-1.5 mb-3">✓ {cfg.snapshotRows.length} snapshot rows loaded</div>}
          <Field label="Business key column">
            <select className={selectCls} value={cfg.keyColumn || ""} onChange={e => onChange({ keyColumn: e.target.value })}>
              <option value="">Select key column…</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </Field>
          {node.type === "scd2" && (
            <Field label="Surrogate key column"><input className={selectCls} value={cfg.surrogateColumn || "surrogate_key"} onChange={e => onChange({ surrogateColumn: e.target.value })} /></Field>
          )}
          <Field label="Tracked columns">
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {headers.filter(h => h !== cfg.keyColumn).map(h => {
                const checked = (cfg.compareColumns || []).includes(h);
                return (
                  <label key={h} className="flex items-center gap-2 text-[12px] cursor-pointer hover:text-[#1A2233]">
                    <input type="checkbox" checked={checked} onChange={() => {
                      const cur: string[] = cfg.compareColumns || [];
                      onChange({ compareColumns: checked ? cur.filter((c: string) => c !== h) : [...cur, h] });
                    }} />
                    <span className="font-mono">{h}</span>
                  </label>
                );
              })}
              {headers.length === 0 && <p className="text-[11px] text-[#9AA1B2]">Attach a Source node first.</p>}
            </div>
          </Field>
        </>
      )}

      {/* NORMALIZER */}
      {node.type === "normalizer" && (
        <>
          <p className="text-[11px] text-[#6B7385] mb-3">Unpivot repeating columns into rows.</p>
          <Field label="Columns to unpivot"><input className={selectCls} placeholder="e.g. jan_sales, feb_sales" value={(cfg.pivotColumns || []).join(", ")} onChange={e => onChange({ pivotColumns: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Field>
          <Field label="Columns to keep"><input className={selectCls} placeholder="e.g. customer_id" value={(cfg.keepColumns || []).join(", ")} onChange={e => onChange({ keepColumns: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Field>
          <Field label="Name column"><input className={selectCls} value={cfg.nameColumn || ""} onChange={e => onChange({ nameColumn: e.target.value })} /></Field>
          <Field label="Value column"><input className={selectCls} value={cfg.valueColumn || ""} onChange={e => onChange({ valueColumn: e.target.value })} /></Field>
        </>
      )}

      {/* TARGET */}
      {node.type === "target" && (
        <>
          <Field label="Destination">
            <div className="flex gap-1.5">
              <button onClick={() => onChange({ mode: "preview" })} className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${cfg.mode !== "connection" ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385]"}`}>Preview only</button>
              <button onClick={() => onChange({ mode: "connection" })} className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${cfg.mode === "connection" ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385]"}`}>Write to DB</button>
            </div>
          </Field>
          {cfg.mode === "connection" ? (
            <>
              <Field label="Connection">
                <select className={selectCls} value={cfg.connectionId || ""} onChange={e => { const c = connections.find(x => x._id === e.target.value); onChange({ connectionId: e.target.value, connectionName: c?.name || "" }); }}>
                  <option value="">Select a connection…</option>
                  {connections.filter(c => c.type === "postgres" || c.type === "mysql").map(c => <option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}
                </select>
              </Field>
              <Field label="Target table"><input className={selectCls} value={cfg.table || ""} onChange={e => onChange({ table: e.target.value })} placeholder="e.g. customers_clean" /></Field>
              <Field label="Write mode">
                <select className={selectCls} value={cfg.writeMode || "insert"} onChange={e => onChange({ writeMode: e.target.value })}>
                  <option value="insert">Insert (append rows)</option>
                  <option value="truncate_insert">Truncate then insert</option>
                </select>
              </Field>
            </>
          ) : (
            <p className="text-[11px] text-[#9AA1B2] leading-relaxed">Run the pipeline to preview output and download as CSV or JSON. No database writes in this mode.</p>
          )}
        </>
      )}

      {/* DEDUPE */}
      {node.type === "dedupe" && (
        <p className="text-[11px] text-[#6B7385] leading-relaxed">Removes duplicate rows. Two rows are duplicates if every column value is identical.</p>
      )}
    </div>
  );
}