"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Workflow, Activity, Plug, ArrowRight, CheckCircle2, XCircle, Clock, TrendingUp, Zap, ListTree } from "lucide-react";

interface Pipeline { _id: string; name: string; environment: string; nodes: any[]; updatedAt: string; }
interface Run { _id: string; pipelineName: string; status: string; rowsOut: number; durationMs: number; environment: string; createdAt: string; }
interface Connection { _id: string; name: string; type: string; }

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-[#E3E7EF] rounded-xl p-5">
      <div className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2] mb-2">{label}</div>
      <div className="text-[28px] font-bold leading-none" style={{ color }}>{value}</div>
      {sub && <div className="text-[11.5px] text-[#9AA1B2] mt-1.5">{sub}</div>}
    </div>
  );
}

function fmt(ms: number) { return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`; }

export default function DashboardPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire all requests in parallel — don't wait for one before starting the next
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

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6FA]">
      <div className="max-w-[1200px] mx-auto p-7">

        {/* HERO */}
        <div className="relative bg-gradient-to-br from-[#0B1220] via-[#111A2E] to-[#1B2740] rounded-2xl p-8 mb-6 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.12]" preserveAspectRatio="none">
            <defs><pattern id="g" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#3A4F8A" strokeWidth="0.6"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>
          <div className="relative z-10 flex items-start justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#5EEAD4] border border-[#5EEAD422] bg-[#5EEAD40A] rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4] animate-pulse"/>
                CogniFlow · Data Engineering Platform
              </div>
              <h1 className="text-white text-[26px] font-bold leading-tight mb-3">Welcome back, Aryan</h1>
              <p className="text-[#8B93AC] text-[13.5px] leading-relaxed mb-5">
                Build, run, and monitor ETL pipelines — CSV to Postgres, API to warehouse, or anything in between. No code.
              </p>
              <div className="flex gap-2.5">
                <Link href="/dashboard/designer/new" className="bg-[#2F6FED] hover:bg-[#245BD1] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors">
                  <Zap size={13}/> New pipeline
                </Link>
                <Link href="/dashboard/pipelines" className="border border-[#2A3752] text-[#C4CBDC] hover:border-[#2F6FED] hover:text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
                  View all pipelines
                </Link>
              </div>
            </div>
            {!loading && (
              <div className="hidden lg:flex flex-col gap-2 min-w-[180px]">
                {[
                  { label: "Pipelines", value: pipelines.length, color: "#2F6FED" },
                  { label: "Total runs", value: runs.length, color: "#7C6AE8" },
                  { label: "Success rate", value: `${successRate}%`, color: "#1FA971" },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.07] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[11.5px] text-[#8B93AC]">{s.label}</span>
                    <span className="text-[17px] font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STAT CARDS — show skeleton while loading */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E3E7EF] rounded-xl p-5 animate-pulse">
                <div className="h-3 bg-[#F0F2F6] rounded w-24 mb-3"/>
                <div className="h-8 bg-[#F0F2F6] rounded w-16 mb-2"/>
                <div className="h-3 bg-[#F0F2F6] rounded w-32"/>
              </div>
            ))
          ) : (
            <>
              <StatCard label="Total pipelines" value={pipelines.length} sub={`${pipelines.filter(p=>p.environment==="DEV").length} DEV · ${pipelines.filter(p=>p.environment==="SIT").length} SIT · ${pipelines.filter(p=>p.environment==="PROD").length} PROD`} color="#2F6FED"/>
              <StatCard label="Runs this session" value={runs.length} sub={`${successRuns} succeeded · ${failedRuns} failed`} color="#7C6AE8"/>
              <StatCard label="Success rate" value={`${successRate}%`} sub={runs.length ? `across ${runs.length} runs` : "no runs yet"} color="#1FA971"/>
              <StatCard label="Connections" value={connections.length} sub={connections.slice(0,2).map(c=>c.name).join(" · ") || "No connections yet"} color="#D98A1E"/>
            </>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-[1fr_340px] gap-5 mb-5">

          {/* Recent runs */}
          <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F2F6]">
              <div className="flex items-center gap-2"><Activity size={14} className="text-[#7C6AE8]"/><span className="text-[13.5px] font-semibold">Recent runs</span></div>
              <Link href="/dashboard/monitor" className="text-[11.5px] text-[#2F6FED] font-semibold hover:underline flex items-center gap-1">View all <ArrowRight size={11}/></Link>
            </div>
            {loading ? (
              <div className="divide-y divide-[#F0F2F6]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-16 h-5 bg-[#F0F2F6] rounded-full"/>
                    <div className="flex-1"><div className="h-3.5 bg-[#F0F2F6] rounded w-40 mb-1.5"/><div className="h-3 bg-[#F0F2F6] rounded w-28"/></div>
                  </div>
                ))}
              </div>
            ) : recentRuns.length === 0 ? (
              <div className="p-8 text-center"><Activity size={28} className="text-[#E3E7EF] mx-auto mb-2"/><p className="text-sm text-[#9AA1B2]">No runs yet.</p></div>
            ) : (
              <div className="divide-y divide-[#F0F2F6]">
                {recentRuns.map(run => (
                  <div key={run._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFBFD]">
                    {run.status === "success"
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={10}/> success</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={10}/> failed</span>}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate">{run.pipelineName}</div>
                      <div className="text-[11px] text-[#9AA1B2] font-mono">{run.rowsOut?.toLocaleString()} rows · {fmt(run.durationMs)} · {run.environment}</div>
                    </div>
                    <div className="text-[11px] text-[#9AA1B2] flex items-center gap-1 whitespace-nowrap"><Clock size={10}/>{new Date(run.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#E3E7EF] rounded-xl p-4">
              <div className="text-[11px] font-mono uppercase tracking-wide text-[#9AA1B2] mb-3">Quick actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "New pipeline", href: "/dashboard/designer/new", icon: Workflow, color: "#2F6FED" },
                  { label: "New taskflow", href: "/dashboard/taskflows/new", icon: ListTree, color: "#7C6AE8" },
                  { label: "Monitor", href: "/dashboard/monitor", icon: Activity, color: "#1FA971" },
                  { label: "Connections", href: "/dashboard/connections", icon: Plug, color: "#D98A1E" },
                ].map(a => (
                  <Link key={a.href} href={a.href} className="flex items-center gap-2.5 border border-[#E3E7EF] rounded-lg px-3 py-2.5 hover:border-[#2F6FED] hover:bg-[#2F6FED08] transition-all">
                    <a.icon size={13} style={{ color: a.color }}/><span className="text-[12.5px] font-medium">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden flex-1">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F2F6]">
                <div className="flex items-center gap-2"><Plug size={13} className="text-[#D98A1E]"/><span className="text-[13px] font-semibold">Connections</span></div>
                <Link href="/dashboard/connections" className="text-[11px] text-[#2F6FED] font-semibold hover:underline">Manage</Link>
              </div>
              {loading ? (
                <div className="p-4 space-y-2 animate-pulse">{[...Array(2)].map((_,i)=><div key={i} className="h-8 bg-[#F0F2F6] rounded"/>)}</div>
              ) : connections.length === 0 ? (
                <div className="p-4 text-center"><p className="text-xs text-[#9AA1B2] mb-2">No connections yet.</p><Link href="/dashboard/connections" className="text-xs text-[#2F6FED] font-semibold">+ Add connection</Link></div>
              ) : (
                <div className="divide-y divide-[#F0F2F6]">
                  {connections.slice(0,4).map(c => (
                    <div key={c._id} className="flex items-center gap-2.5 px-4 py-2.5">
                      <div className="w-6 h-6 rounded bg-[#2F6FED14] flex items-center justify-center"><Plug size={11} className="text-[#2F6FED]"/></div>
                      <div><div className="text-[12.5px] font-semibold">{c.name}</div><div className="text-[10.5px] font-mono text-[#9AA1B2]">{c.type}</div></div>
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
            <div className="flex items-center gap-2"><Workflow size={14} className="text-[#2F6FED]"/><span className="text-[13.5px] font-semibold">Recent pipelines</span></div>
            <Link href="/dashboard/pipelines" className="text-[11.5px] text-[#2F6FED] font-semibold hover:underline flex items-center gap-1">All pipelines <ArrowRight size={11}/></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-4 divide-x divide-[#F0F2F6]">
              {[...Array(4)].map((_,i) => <div key={i} className="p-4 animate-pulse"><div className="h-4 bg-[#F0F2F6] rounded mb-3 w-16"/><div className="h-5 bg-[#F0F2F6] rounded mb-2"/><div className="h-3 bg-[#F0F2F6] rounded w-24"/></div>)}
            </div>
          ) : recentPipelines.length === 0 ? (
            <div className="p-10 text-center">
              <Workflow size={32} className="text-[#E3E7EF] mx-auto mb-3"/>
              <p className="text-sm text-[#9AA1B2] mb-3">No pipelines yet.</p>
              <Link href="/dashboard/designer/new" className="text-xs font-semibold bg-[#2F6FED] text-white px-4 py-2 rounded-lg inline-block">+ New pipeline</Link>
            </div>
          ) : (
            <div className="grid grid-cols-4 divide-x divide-[#F0F2F6]">
              {recentPipelines.map(p => (
                <div key={p._id} onClick={() => router.push(`/dashboard/designer/${p._id}`)} className="p-4 hover:bg-[#FAFBFD] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${p.environment==="PROD"?"bg-emerald-50 text-emerald-600":p.environment==="SIT"?"bg-amber-50 text-amber-600":"bg-[#2F6FED14] text-[#2F6FED]"}`}>{p.environment}</span>
                    <span className="text-[10px] font-mono text-[#9AA1B2]">{p.nodes.length} steps</span>
                  </div>
                  <div className="text-[13px] font-semibold mb-1.5 truncate">{p.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {p.nodes.slice(0,3).map((n:any,i:number) => <span key={i} className="text-[10px] bg-[#F4F6FA] text-[#6B7385] px-1.5 py-0.5 rounded font-mono">{n.type}</span>)}
                    {p.nodes.length > 3 && <span className="text-[10px] text-[#9AA1B2]">+{p.nodes.length-3}</span>}
                  </div>
                  <div className="text-[10.5px] text-[#9AA1B2] mt-2">{new Date(p.updatedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, color: "#2F6FED", title: "Environment promotion", desc: "Build in DEV, promote to SIT then PROD. Visual diff shows what changed.", href: "/dashboard/pipelines" },
            { icon: Zap, color: "#7C6AE8", title: "AI-assisted transforms", desc: "Upload a CSV, click Suggest transforms (AI) — get smart recommendations.", href: "/dashboard/designer/new" },
            { icon: ListTree, color: "#1FA971", title: "Taskflows & schedules", desc: "Chain pipelines, set a schedule, get email alerts on every run.", href: "/dashboard/taskflows" },
          ].map(tip => (
            <Link key={tip.title} href={tip.href} className="bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: tip.color+"14" }}>
                <tip.icon size={16} style={{ color: tip.color }}/>
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