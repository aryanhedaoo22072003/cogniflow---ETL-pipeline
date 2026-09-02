// "use client";

// import { useEffect, useState } from "react";
// import { Download } from "lucide-react";
// import { safeFetchJson } from "@/lib/api";

// export default function MonitorPage() {
//   const [runs, setRuns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     safeFetchJson<{ runs: any[] }>("/api/runs?limit=100").then((r) => {
//       setRuns(r.data?.runs || []);
//       setLoading(false);
//     });
//   }, []);

//   function downloadLog(run: any) {
//     const lines = [
//       `Pipeline: ${run.pipelineName}`,
//       `Status: ${run.status}`,
//       `Environment: ${run.environment}`,
//       `Run time: ${new Date(run.createdAt).toLocaleString()}`,
//       `Rows: ${run.rowsIn} → ${run.rowsOut}`,
//       `Duration: ${run.durationMs}ms`,
//       "",
//       "Steps:",
//       ...run.steps.map((s: any, i: number) => `  ${i + 1}. [${s.ok ? "OK" : "FAIL"}] ${s.label} — ${s.message} (${s.rowsIn} → ${s.rowsOut} rows)`),
//     ].join("\n");
//     const blob = new Blob([lines], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${run.pipelineName.replace(/\s+/g, "_")}_${new Date(run.createdAt).toISOString().slice(0, 19)}.log.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="p-7 overflow-y-auto">
//       <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Monitor</span></div>
//       <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Monitor</h1>
//       <p className="text-[13.5px] text-[#6B7385] mb-6">Execution history across all pipelines in this environment.</p>

//       <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
//         <table className="w-full text-[13px]">
//           <thead>
//             <tr className="bg-[#FAFBFD] text-[11.5px] uppercase tracking-wide text-[#6B7385]">
//               <th className="text-left px-4 py-2.5">Pipeline</th>
//               <th className="text-left px-4 py-2.5">Status</th>
//               <th className="text-left px-4 py-2.5">Steps</th>
//               <th className="text-left px-4 py-2.5">Rows in → out</th>
//               <th className="text-left px-4 py-2.5">Duration</th>
//               <th className="text-left px-4 py-2.5">Run time</th>
//               <th className="px-4 py-2.5"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={7} className="text-center text-[#9AA1B2] py-6">Loading…</td></tr>
//             ) : runs.length === 0 ? (
//               <tr><td colSpan={7} className="text-center text-[#9AA1B2] py-6">No executions yet.</td></tr>
//             ) : (
//               runs.map((r) => (
//                 <tr key={r._id} className="border-t border-[#F0F2F6] hover:bg-[#FAFBFD]">
//                   <td className="px-4 py-2.5">{r.pipelineName}</td>
//                   <td className="px-4 py-2.5">
//                     <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${r.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
//                       <span className="w-1.5 h-1.5 rounded-full bg-current" />
//                       {r.status === "success" ? "Success" : "Failed"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.steps?.length ?? 0}</td>
//                   <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.rowsIn} → {r.rowsOut}</td>
//                   <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.durationMs}ms</td>
//                   <td className="px-4 py-2.5 font-mono text-[#6B7385]">{new Date(r.createdAt).toLocaleString()}</td>
//                   <td className="px-4 py-2.5 text-right">
//                     <button onClick={() => downloadLog(r)} className="text-xs font-semibold text-[#2F6FED] flex items-center gap-1 ml-auto hover:underline">
//                       <Download size={12} /> Log
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { Activity, CheckCircle2, XCircle, Clock, ChevronRight, ChevronDown, ArrowRight, Database, Filter, BarChart2, GitMerge, Target } from "lucide-react";

interface Step {
  nodeId: string;
  label: string;
  ok: boolean;
  message: string;
  rowsIn: number;
  rowsOut: number;
}

interface Run {
  _id: string;
  pipelineId: string;
  pipelineName: string;
  status: "success" | "failed";
  environment: string;
  rowsIn: number;
  rowsOut: number;
  durationMs: number;
  steps: Step[];
  createdAt: string;
}

function fmt(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function nodeIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("source")) return <Database size={12} className="text-blue-500" />;
  if (l.includes("filter")) return <Filter size={12} className="text-violet-500" />;
  if (l.includes("target")) return <Target size={12} className="text-emerald-500" />;
  if (l.includes("join") || l.includes("union")) return <GitMerge size={12} className="text-amber-500" />;
  return <BarChart2 size={12} className="text-[#7C6AE8]" />;
}

function RunRow({ run }: { run: Run }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#E3E7EF] rounded-xl overflow-hidden mb-3">
      {/* Run header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 bg-white cursor-pointer hover:bg-[#FAFBFD] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {run.status === "success"
          ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
          : <XCircle size={16} className="text-red-500 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold truncate">{run.pipelineName}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold flex-shrink-0
              ${run.environment === "PROD" ? "bg-emerald-50 text-emerald-600" :
                run.environment === "SIT" ? "bg-amber-50 text-amber-600" :
                "bg-[#2F6FED14] text-[#2F6FED]"}`}>
              {run.environment}
            </span>
          </div>
          <div className="text-[11px] text-[#9AA1B2] font-mono mt-0.5">
            {run.rowsIn?.toLocaleString()} in → {run.rowsOut?.toLocaleString()} out · {fmt(run.durationMs)} · {run.steps?.length || 0} steps
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-[11px] text-[#9AA1B2] flex items-center gap-1">
            <Clock size={10} />
            {new Date(run.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </div>
          {expanded
            ? <ChevronDown size={14} className="text-[#9AA1B2]" />
            : <ChevronRight size={14} className="text-[#9AA1B2]" />}
        </div>
      </div>

      {/* Data lineage drill-down */}
      {expanded && (
        <div className="border-t border-[#F0F2F6] bg-[#FAFBFD] px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA1B2] mb-4">
            Data lineage — row flow through each step
          </div>

          {/* Flow diagram */}
          <div className="flex items-start gap-1 overflow-x-auto pb-2 mb-4">
            {(run.steps || []).map((step, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <div className={`rounded-lg border px-3 py-2 min-w-[120px] ${step.ok ? "border-[#E3E7EF] bg-white" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {nodeIcon(step.label)}
                    <span className="text-[11px] font-semibold truncate max-w-[90px]">{step.label}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#9AA1B2]">
                    {step.rowsIn?.toLocaleString() || 0} → {step.rowsOut?.toLocaleString() || 0}
                  </div>
                  {!step.ok && (
                    <div className="text-[10px] text-red-500 mt-1 font-medium">✗ failed</div>
                  )}
                </div>
                {i < (run.steps?.length || 0) - 1 && (
                  <ArrowRight size={12} className="text-[#C5CADE] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Step detail table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white border border-[#E3E7EF] rounded-lg">
                <th className="text-left px-3 py-2 text-[#9AA1B2] font-semibold">Step</th>
                <th className="text-left px-3 py-2 text-[#9AA1B2] font-semibold">Status</th>
                <th className="text-right px-3 py-2 text-[#9AA1B2] font-semibold">Rows in</th>
                <th className="text-right px-3 py-2 text-[#9AA1B2] font-semibold">Rows out</th>
                <th className="text-right px-3 py-2 text-[#9AA1B2] font-semibold">Dropped</th>
                <th className="text-left px-3 py-2 text-[#9AA1B2] font-semibold">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6FA]">
              {(run.steps || []).map((step, i) => {
                const dropped = (step.rowsIn || 0) - (step.rowsOut || 0);
                return (
                  <tr key={i} className={`${!step.ok ? "bg-red-50" : i % 2 === 0 ? "bg-white" : "bg-[#FAFBFD]"}`}>
                    <td className="px-3 py-2 font-medium text-[#1A2233]">{step.label}</td>
                    <td className="px-3 py-2">
                      {step.ok
                        ? <span className="text-emerald-600 font-semibold">✓ ok</span>
                        : <span className="text-red-500 font-semibold">✗ failed</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[#6B7385]">{step.rowsIn?.toLocaleString() || 0}</td>
                    <td className="px-3 py-2 text-right font-mono text-[#6B7385]">{step.rowsOut?.toLocaleString() || 0}</td>
                    <td className={`px-3 py-2 text-right font-mono font-semibold ${dropped > 0 ? "text-amber-600" : "text-[#C5CADE]"}`}>
                      {dropped > 0 ? `-${dropped.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-[#6B7385] max-w-[200px] truncate">{step.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MonitorPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    fetch("/api/runs")
      .then(r => r.json())
      .then(d => { setRuns(d.runs || []); setLoading(false); });
  }, []);

  const filtered = runs.filter(r => {
    if (filter === "success" && r.status !== "success") return false;
    if (filter === "failed" && r.status !== "failed") return false;
    if (search && !r.pipelineName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice(0, page * PER_PAGE);
  const successCount = runs.filter(r => r.status === "success").length;
  const failedCount = runs.filter(r => r.status === "failed").length;
  const avgDuration = runs.length ? Math.round(runs.reduce((a, r) => a + r.durationMs, 0) / runs.length) : 0;
  const totalRowsProcessed = runs.reduce((a, r) => a + (r.rowsOut || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2233] mb-1">Monitor</h1>
        <p className="text-[13px] text-[#6B7385]">Full run history with per-step data lineage.</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total runs", value: runs.length, color: "#2F6FED" },
            { label: "Succeeded", value: successCount, color: "#1FA971" },
            { label: "Failed", value: failedCount, color: "#DA4B4B" },
            { label: "Avg duration", value: fmt(avgDuration), color: "#D98A1E" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E3E7EF] rounded-xl p-4">
              <div className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2] mb-1.5">{s.label}</div>
              <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <input
          className="border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:border-[#2F6FED]"
          placeholder="Search by pipeline name…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex gap-1.5">
          {(["all", "success", "failed"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors capitalize ${filter === f ? "border-[#2F6FED] bg-[#2F6FED] text-white" : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"}`}>
              {f}
              {f === "success" && ` (${successCount})`}
              {f === "failed" && ` (${failedCount})`}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[12px] text-[#9AA1B2]">
          {totalRowsProcessed.toLocaleString()} total rows processed
        </div>
      </div>

      {/* Run list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-[#E3E7EF] rounded-xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-4 h-4 bg-[#F0F2F6] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-[#F0F2F6] rounded w-48 mb-2" />
                  <div className="h-3 bg-[#F0F2F6] rounded w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Activity size={32} className="text-[#E3E7EF] mx-auto mb-3" />
          <p className="text-sm text-[#9AA1B2]">
            {search || filter !== "all" ? "No runs match your filter." : "No runs yet — run a pipeline to see history here."}
          </p>
        </div>
      ) : (
        <>
          {paginated.map(run => <RunRow key={run._id} run={run} />)}
          {paginated.length < filtered.length && (
            <button onClick={() => setPage(p => p + 1)}
              className="w-full text-sm font-semibold text-[#2F6FED] border border-[#E3E7EF] rounded-xl py-3 hover:border-[#2F6FED] hover:bg-[#2F6FED08] transition-colors mt-2">
              Load more ({filtered.length - paginated.length} remaining)
            </button>
          )}
        </>
      )}
    </div>
  );
}