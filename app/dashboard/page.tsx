// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Database, Globe } from "lucide-react";

// export default function DashboardPage() {
//   const [stats, setStats] = useState({ pipelines: 0, connections: 0, runs: 0 });
//   const [recent, setRecent] = useState<any[]>([]);

//   useEffect(() => {
//     Promise.all([
//       fetch("/api/pipelines").then((r) => r.json()),
//       fetch("/api/connections").then((r) => r.json()),
//       fetch("/api/runs?limit=6").then((r) => r.json()),
//     ]).then(([p, c, r]) => {
//       setStats({
//         pipelines: p.pipelines?.length || 0,
//         connections: c.connections?.length || 0,
//         runs: r.runs?.length || 0,
//       });
//       setRecent(r.runs || []);
//     });
//   }, []);

//   return (
//     <div className="p-7 overflow-y-auto bg-[#F4F6FA] dark:bg-[#0E0F1A] min-h-full">

//       {/* HERO */}
//       <div className="relative bg-gradient-to-br from-[#0B1220] via-[#111A2E] to-[#1B2740] rounded-2xl p-7 mb-7 overflow-hidden">
//         <svg className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none">
//           <defs>
//             <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
//               <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#3A4F8A" strokeWidth="0.6" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />
//         </svg>
//         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 260" preserveAspectRatio="none">
//           {[
//             "M0,60 C150,20 250,120 400,80 S650,20 1000,90",
//             "M0,150 C180,190 300,110 480,160 S720,220 1000,170",
//             "M0,220 C200,240 350,180 520,215 S760,260 1000,230",
//           ].map((d, i) => (
//             <path key={i} d={d} fill="none" stroke="#3F6FED" strokeWidth="1.2" opacity={0.35 - i * 0.06} />
//           ))}
//           {[
//             { cx: 60, cy: 60 }, { cx: 400, cy: 80 }, { cx: 1000, cy: 90 },
//             { cx: 180, cy: 190 }, { cx: 480, cy: 160 }, { cx: 900, cy: 170 },
//             { cx: 350, cy: 180 }, { cx: 760, cy: 260 },
//           ].map((p, i) => (
//             <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="#5EEAD4" opacity="0.6">
//               <animate attributeName="opacity" values="0.15;0.7;0.15" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
//             </circle>
//           ))}
//         </svg>

//         <div className="relative z-10 max-w-lg">
//           <h1 className="text-white text-[22px] font-semibold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
//             Welcome back
//           </h1>
//           <p className="text-[#B8C0D8] text-[13.5px] leading-relaxed">
//             CogniFlow moves data from any source through enterprise-grade transforms — without writing a script for it.
//           </p>
//           <div className="flex gap-2 mt-5">
//             <Link href="/dashboard/designer/new" className="bg-[#2F6FED] text-white text-xs font-semibold px-4 py-2 rounded-lg">
//               + New pipeline
//             </Link>
//             <Link href="/dashboard/templates" className="border border-[#3A4664] text-[#C4CBDC] text-xs font-semibold px-4 py-2 rounded-lg">
//               Browse templates
//             </Link>
//           </div>
//         </div>

//         <div className="absolute right-0 top-0 bottom-0 w-[42%] hidden md:block opacity-90 z-10">
//           <div className="relative h-full flex flex-col justify-center gap-8 pr-8">
//             {[
//               { icon: Database, label: "Postgres", color: "#5B9CF6" },
//               { icon: Globe, label: "REST API", color: "#F2A65A" },
//               { icon: Database, label: "MySQL", color: "#4ADE9C" },
//             ].map((s, i) => (
//               <div key={s.label} className="relative h-6">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full h-px bg-[#2A3752]" />
//                 </div>
//                 <div className="pipeline-dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}`, animationDelay: `${i * 1.1}s` }} />
//                 <div className="absolute left-0 -top-5 flex items-center gap-1.5 text-[10px] font-mono text-[#8B93AC]">
//                   <s.icon size={11} style={{ color: s.color }} /> {s.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-3 gap-4 mb-7">
//         {[
//           { label: "Pipelines", value: stats.pipelines, href: "/dashboard/pipelines" },
//           { label: "Connections", value: stats.connections, href: "/dashboard/connections" },
//           { label: "Runs", value: stats.runs, href: "/dashboard/monitor" },
//         ].map((s) => (
//           <Link key={s.label} href={s.href}
//             className="bg-white dark:bg-[#161829] border border-[#E3E7EF] dark:border-[#2A2E4A] rounded-xl p-5 hover:border-[#2F6FED] transition-colors">
//             <div className="text-[28px] font-bold text-[#1A2233] dark:text-[#EAEBF5]" style={{ fontFamily: "'Space Grotesk'" }}>
//               {s.value}
//             </div>
//             <div className="text-[12.5px] text-[#6B7385] dark:text-[#8B8FB0] mt-0.5">{s.label}</div>
//           </Link>
//         ))}
//       </div>

//       {/* RECENT RUNS */}
//       {recent.length > 0 && (
//         <div className="bg-white dark:bg-[#161829] border border-[#E3E7EF] dark:border-[#2A2E4A] rounded-xl overflow-hidden">
//           <div className="px-5 py-3 border-b border-[#E3E7EF] dark:border-[#2A2E4A] flex items-center justify-between">
//             <h3 className="text-[13.5px] font-semibold text-[#1A2233] dark:text-[#EAEBF5]">Recent runs</h3>
//             <Link href="/dashboard/monitor" className="text-xs text-[#2F6FED] hover:underline">View all</Link>
//           </div>
//           <table className="w-full text-[13px]">
//             <thead>
//               <tr className="bg-[#FAFBFD] dark:bg-[#1B2740] text-[11px] uppercase tracking-wide text-[#6B7385] dark:text-[#8B8FB0]">
//                 <th className="text-left px-5 py-2.5">Pipeline</th>
//                 <th className="text-left px-5 py-2.5">Status</th>
//                 <th className="text-left px-5 py-2.5">Rows out</th>
//                 <th className="text-left px-5 py-2.5">Time</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recent.map((r) => (
//                 <tr key={r._id} className="border-t border-[#F0F2F6] dark:border-[#2A2E4A]">
//                   <td className="px-5 py-2.5 text-[#1A2233] dark:text-[#EAEBF5] font-medium">{r.pipelineName}</td>
//                   <td className="px-5 py-2.5">
//                     <span className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${
//                       r.status === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-red-50 text-red-500 dark:bg-red-900/30"
//                     }`}>{r.status}</span>
//                   </td>
//                   <td className="px-5 py-2.5 text-[#9AA1B2]">{r.rowsOut} rows</td>
//                   <td className="px-5 py-2.5 text-[#9AA1B2] text-xs">{new Date(r.createdAt).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {recent.length === 0 && (
//         <div className="bg-white dark:bg-[#161829] border border-[#E3E7EF] dark:border-[#2A2E4A] rounded-xl p-10 text-center">
//           <p className="text-[#9AA1B2] text-sm mb-3">No runs yet — build a pipeline and hit Run to see results here.</p>
//           <Link href="/dashboard/designer/new" className="text-xs font-semibold text-[#2F6FED] hover:underline">
//             Create your first pipeline →
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Workflow, Activity, Plug, ArrowRight, CheckCircle2,
  XCircle, Clock, Database, Globe, TrendingUp, Zap, ListTree
} from "lucide-react";

interface Pipeline { _id: string; name: string; environment: string; nodes: any[]; headers: string[]; updatedAt: string; }
interface Run { _id: string; pipelineName: string; status: string; rowsIn: number; rowsOut: number; durationMs: number; environment: string; createdAt: string; }
interface Connection { _id: string; name: string; type: string; }

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-[#E3E7EF] rounded-xl p-5">
      <div className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2] mb-2">{label}</div>
      <div className="text-[28px] font-bold leading-none" style={{ fontFamily: "'Space Grotesk'", color }}>{value}</div>
      {sub && <div className="text-[11.5px] text-[#9AA1B2] mt-1.5">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "success"
    ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> success</span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={10} /> failed</span>;
}

function fmt(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/pipelines").then(r => r.json()).catch(() => ({ pipelines: [] })),
      fetch("/api/runs").then(r => r.json()).catch(() => ({ runs: [] })),
      fetch("/api/connections").then(r => r.json()).catch(() => ({ connections: [] })),
    ]).then(([p, ru, c]) => {
      setPipelines(p.pipelines || []);
      setRuns(ru.runs || []);
      setConnections(c.connections || []);
      setLoading(false);
    });
  }, []);

  const successRuns = runs.filter(r => r.status === "success").length;
  const failedRuns = runs.filter(r => r.status === "failed").length;
  const successRate = runs.length ? Math.round((successRuns / runs.length) * 100) : 0;
  const recentRuns = runs.slice(0, 6);
  const recentPipelines = pipelines.slice(0, 4);

  const connTypeIcon = (type: string) => {
    if (type === "postgres" || type === "mysql") return <Database size={13} className="text-[#5B9CF6]" />;
    return <Globe size={13} className="text-[#F2A65A]" />;
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6FA]">
      <div className="max-w-[1200px] mx-auto p-7">

        {/* HERO */}
        <div className="relative bg-gradient-to-br from-[#0B1220] via-[#111A2E] to-[#1B2740] rounded-2xl p-8 mb-6 overflow-hidden">
          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" preserveAspectRatio="none">
            <defs>
              <pattern id="dashGrid" width="34" height="34" patternUnits="userSpaceOnUse">
                <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#3A4F8A" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashGrid)" />
          </svg>
          {/* Animated lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 220" preserveAspectRatio="none">
            <path d="M0,60 C200,20 400,110 600,70 S900,20 1200,80" fill="none" stroke="#2F6FED" strokeWidth="1" opacity="0.3" />
            <path d="M0,140 C220,180 380,100 580,150 S860,200 1200,160" fill="none" stroke="#7C6AE8" strokeWidth="1" opacity="0.25" />
            {[
              { cx: 60, cy: 60 }, { cx: 600, cy: 70 }, { cx: 1140, cy: 80 },
              { cx: 220, cy: 180 }, { cx: 580, cy: 150 }, { cx: 950, cy: 170 },
            ].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#5EEAD4" opacity="0.5">
                <animate attributeName="opacity" values="0.1;0.6;0.1" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
              </circle>
            ))}
          </svg>

          <div className="relative z-10 flex items-start justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#5EEAD4] border border-[#5EEAD422] bg-[#5EEAD40A] rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4] animate-pulse" />
                CogniFlow · Data Engineering Platform
              </div>
              <h1 className="text-white text-[26px] font-bold leading-tight mb-3" style={{ fontFamily: "'Space Grotesk'" }}>
                Welcome back, Aryan
              </h1>
              <p className="text-[#8B93AC] text-[13.5px] leading-relaxed mb-5">
                Build, run, and monitor ETL pipelines — CSV to Postgres, API to warehouse, or anything
                in between. No code. Enterprise-grade transforms at your speed.
              </p>
              <div className="flex gap-2.5">
                <Link href="/dashboard/designer/new" className="bg-[#2F6FED] hover:bg-[#245BD1] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors">
                  <Zap size={13} /> New pipeline
                </Link>
                <Link href="/dashboard/pipelines" className="border border-[#2A3752] text-[#C4CBDC] hover:border-[#2F6FED] hover:text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
                  View all pipelines
                </Link>
              </div>
            </div>

            {/* Live stats panel */}
            {!loading && (
              <div className="hidden lg:flex flex-col gap-2 min-w-[200px]">
                {[
                  { label: "Pipelines", value: pipelines.length, color: "#2F6FED" },
                  { label: "Total runs", value: runs.length, color: "#7C6AE8" },
                  { label: "Success rate", value: `${successRate}%`, color: "#1FA971" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.07] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[11.5px] text-[#8B93AC]">{s.label}</span>
                    <span className="text-[17px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STAT CARDS */}
        {!loading && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Total pipelines" value={pipelines.length} sub={`${pipelines.filter(p => p.environment === "DEV").length} DEV · ${pipelines.filter(p => p.environment === "SIT").length} SIT · ${pipelines.filter(p => p.environment === "PROD").length} PROD`} color="#2F6FED" />
            <StatCard label="Runs this session" value={runs.length} sub={`${successRuns} succeeded · ${failedRuns} failed`} color="#7C6AE8" />
            <StatCard label="Success rate" value={`${successRate}%`} sub={runs.length ? `across ${runs.length} runs` : "no runs yet"} color="#1FA971" />
            <StatCard label="Connections" value={connections.length} sub={connections.slice(0, 2).map(c => c.name).join(" · ") || "No connections yet"} color="#D98A1E" />
          </div>
        )}

        {/* MAIN GRID — Recent runs + Recent pipelines */}
        <div className="grid grid-cols-[1fr_360px] gap-5 mb-5">

          {/* Recent runs */}
          <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F2F6]">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[#7C6AE8]" />
                <span className="text-[13.5px] font-semibold">Recent runs</span>
              </div>
              <Link href="/dashboard/monitor" className="text-[11.5px] text-[#2F6FED] font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 text-sm text-[#9AA1B2] text-center">Loading…</div>
            ) : recentRuns.length === 0 ? (
              <div className="p-8 text-center">
                <Activity size={28} className="text-[#E3E7EF] mx-auto mb-2" />
                <p className="text-sm text-[#9AA1B2]">No runs yet. Build a pipeline and hit ▶ Run.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F2F6]">
                {recentRuns.map((run) => (
                  <div key={run._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFBFD] transition-colors">
                    <StatusBadge status={run.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate">{run.pipelineName}</div>
                      <div className="text-[11px] text-[#9AA1B2] font-mono mt-0.5">
                        {run.rowsOut?.toLocaleString()} rows · {fmt(run.durationMs)} · {run.environment}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#9AA1B2] whitespace-nowrap flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(run.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Quick actions */}
            <div className="bg-white border border-[#E3E7EF] rounded-xl p-4">
              <div className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2] mb-3">Quick actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "New pipeline", href: "/dashboard/designer/new", icon: Workflow, color: "#2F6FED" },
                  { label: "New taskflow", href: "/dashboard/taskflows/new", icon: ListTree, color: "#7C6AE8" },
                  { label: "Monitor", href: "/dashboard/monitor", icon: Activity, color: "#1FA971" },
                  { label: "Connections", href: "/dashboard/connections", icon: Plug, color: "#D98A1E" },
                ].map((a) => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-2.5 border border-[#E3E7EF] rounded-lg px-3 py-2.5 hover:border-[#2F6FED] hover:bg-[#2F6FED08] transition-all group">
                    <a.icon size={13} style={{ color: a.color }} />
                    <span className="text-[12.5px] font-medium text-[#1A2233]">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden flex-1">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F2F6]">
                <div className="flex items-center gap-2">
                  <Plug size={13} className="text-[#D98A1E]" />
                  <span className="text-[13px] font-semibold">Connections</span>
                </div>
                <Link href="/dashboard/connections" className="text-[11px] text-[#2F6FED] font-semibold hover:underline">Manage</Link>
              </div>
              {loading ? (
                <div className="p-4 text-xs text-[#9AA1B2]">Loading…</div>
              ) : connections.length === 0 ? (
                <div className="p-5 text-center">
                  <p className="text-xs text-[#9AA1B2] mb-2">No connections yet.</p>
                  <Link href="/dashboard/connections" className="text-xs text-[#2F6FED] font-semibold hover:underline">+ Add connection</Link>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F2F6]">
                  {connections.slice(0, 4).map((c) => (
                    <div key={c._id} className="flex items-center gap-2.5 px-4 py-2.5">
                      {connTypeIcon(c.type)}
                      <div>
                        <div className="text-[12.5px] font-semibold">{c.name}</div>
                        <div className="text-[10.5px] font-mono text-[#9AA1B2]">{c.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent pipelines */}
        <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F2F6]">
            <div className="flex items-center gap-2">
              <Workflow size={14} className="text-[#2F6FED]" />
              <span className="text-[13.5px] font-semibold">Recent pipelines</span>
            </div>
            <Link href="/dashboard/pipelines" className="text-[11.5px] text-[#2F6FED] font-semibold hover:underline flex items-center gap-1">
              All pipelines <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 text-sm text-[#9AA1B2] text-center">Loading…</div>
          ) : recentPipelines.length === 0 ? (
            <div className="p-10 text-center">
              <Workflow size={32} className="text-[#E3E7EF] mx-auto mb-3" />
              <p className="text-sm text-[#9AA1B2] mb-3">No pipelines yet. Start with a Source → Transform → Target flow.</p>
              <Link href="/dashboard/designer/new" className="text-xs font-semibold bg-[#2F6FED] text-white px-4 py-2 rounded-lg inline-block hover:bg-[#245BD1]">
                + New pipeline
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-4 divide-x divide-[#F0F2F6]">
              {recentPipelines.map((p) => (
                <div
                  key={p._id}
                  onClick={() => router.push(`/dashboard/designer/${p._id}`)}
                  className="p-4 hover:bg-[#FAFBFD] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold
                      ${p.environment === "PROD" ? "bg-emerald-50 text-emerald-600" :
                        p.environment === "SIT" ? "bg-amber-50 text-amber-600" :
                        "bg-[#2F6FED14] text-[#2F6FED]"}`}>
                      {p.environment}
                    </span>
                    <span className="text-[10px] font-mono text-[#9AA1B2]">{p.nodes.length} steps</span>
                  </div>
                  <div className="text-[13.5px] font-semibold mb-1.5 truncate" style={{ fontFamily: "'Space Grotesk'" }}>{p.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {p.nodes.slice(0, 3).map((n: any, i: number) => (
                      <span key={i} className="text-[10px] bg-[#F4F6FA] text-[#6B7385] px-1.5 py-0.5 rounded font-mono">{n.type}</span>
                    ))}
                    {p.nodes.length > 3 && <span className="text-[10px] text-[#9AA1B2]">+{p.nodes.length - 3}</span>}
                  </div>
                  <div className="text-[10.5px] text-[#9AA1B2] mt-2">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {recentPipelines.length < 4 && (
                <div
                  onClick={() => router.push("/dashboard/designer/new")}
                  className="p-4 hover:bg-[#FAFBFD] cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 text-[#9AA1B2] hover:text-[#2F6FED] border-dashed"
                >
                  <div className="w-8 h-8 rounded-lg border-2 border-dashed border-[#E3E7EF] flex items-center justify-center text-lg">+</div>
                  <span className="text-xs font-medium">New pipeline</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips/features row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              color: "#2F6FED",
              title: "Environment promotion",
              desc: "Build in DEV, promote to SIT then PROD. Visual diff shows exactly what changed between environments.",
              href: "/dashboard/pipelines",
            },
            {
              icon: Zap,
              color: "#7C6AE8",
              title: "AI-assisted transforms",
              desc: "Upload a CSV, click 'Suggest transforms (AI)' — the AI reads your column profiles and recommends steps.",
              href: "/dashboard/designer/new",
            },
            {
              icon: ListTree,
              color: "#1FA971",
              title: "Taskflows & schedules",
              desc: "Chain multiple pipelines to run in sequence. Set a schedule to run them daily at any timezone.",
              href: "/dashboard/taskflows",
            },
          ].map((tip) => (
            <Link key={tip.title} href={tip.href}
              className="bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: tip.color + "14" }}>
                <tip.icon size={16} style={{ color: tip.color }} />
              </div>
              <div className="text-[13.5px] font-semibold mb-1.5">{tip.title}</div>
              <p className="text-[12px] text-[#6B7385] leading-relaxed">{tip.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}