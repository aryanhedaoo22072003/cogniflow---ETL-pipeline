"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Workflow, Database, Sheet, Globe } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

export default function HomePage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      safeFetchJson<{ pipelines: any[] }>("/api/pipelines"),
      safeFetchJson<{ runs: any[] }>("/api/runs?limit=6"),
      safeFetchJson<{ connections: any[] }>("/api/connections"),
    ]).then(([p, r, c]) => {
      setPipelines(p.data?.pipelines || []);
      setRuns(r.data?.runs || []);
      setConnections(c.data?.connections || []);
      setLoading(false);
    });
  }, []);

  const successCount = runs.filter((r) => r.status === "success").length;
  const failCount = runs.filter((r) => r.status === "failed").length;
  const activeConnections = connections.filter((c) => c.lastStatus === "ok").length;

  return (
    <div className="p-7 overflow-y-auto">
      <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Overview</span></div>

      {/* HERO 
      <div className="relative bg-gradient-to-br from-[#111A2E] to-[#1B2740] rounded-2xl p-7 mb-7 overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-white text-[22px] font-semibold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
            Welcome back, Aryan
          </h1>
          <p className="text-[#B8C0D8] text-[13.5px] leading-relaxed">
            CogniFlow moves data from any source — a CSV, a Postgres table, a live API — through the same
            transform pipeline you'd build in an enterprise ETL tool, without writing a script for it.
            Everything below is live: real pipelines, real connections, real execution history.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href="/dashboard/designer/new" className="bg-[#2F6FED] text-white text-xs font-semibold px-4 py-2 rounded-lg">
              + New pipeline
            </Link>
            <Link href="/dashboard/connections" className="border border-[#3A4664] text-[#C4CBDC] text-xs font-semibold px-4 py-2 rounded-lg">
              Manage connections
            </Link>
          </div>
        </div>

        {/* animated pipeline strip *
        <div className="absolute right-0 top-0 bottom-0 w-[42%] hidden md:block opacity-90">
          <div className="relative h-full flex flex-col justify-center gap-8 pr-8">
            {[
              { icon: Database, label: "Postgres", color: "#5B9CF6" },
              { icon: Sheet, label: "Sheets", color: "#4ADE9C" },
              { icon: Globe, label: "REST API", color: "#F2A65A" },
            ].map((s, i) => (
              <div key={s.label} className="relative h-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-[#2A3752]" />
                </div>
                <div className="pipeline-dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}`, animationDelay: `${i * 1.1}s` }} />
                <div className="absolute left-0 -top-5 flex items-center gap-1.5 text-[10px] font-mono text-[#8B93AC]">
                  <s.icon size={11} style={{ color: s.color }} /> {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* HERO */}
      <div className="relative bg-gradient-to-br from-[#0B1220] via-[#111A2E] to-[#1B2740] rounded-2xl p-7 mb-7 overflow-hidden">
        {/* schematic data-network background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#3A4F8A" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 260" preserveAspectRatio="none">
          {[
            "M0,60 C150,20 250,120 400,80 S650,20 1000,90",
            "M0,150 C180,190 300,110 480,160 S720,220 1000,170",
            "M0,220 C200,240 350,180 520,215 S760,260 1000,230",
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#3F6FED" strokeWidth="1.2" opacity={0.35 - i * 0.06} />
          ))}
          {[
            { cx: 60, cy: 60 }, { cx: 400, cy: 80 }, { cx: 1000, cy: 90 },
            { cx: 180, cy: 190 }, { cx: 480, cy: 160 }, { cx: 900, cy: 170 },
            { cx: 350, cy: 180 }, { cx: 760, cy: 260 },
          ].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="#5EEAD4" opacity="0.6">
              <animate attributeName="opacity" values="0.15;0.7;0.15" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </circle>
          ))}
        </svg>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-white text-[22px] font-semibold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
            Welcome back, Aryan
          </h1>
          <p className="text-[#B8C0D8] text-[13.5px] leading-relaxed">
            CogniFlow moves data from any source — a CSV, a Postgres table, a live API — through the same
            transform pipeline you'd build in an enterprise ETL tool, without writing a script for it.
            Everything below is live: real pipelines, real connections, real execution history.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href="/dashboard/designer/new" className="bg-[#2F6FED] text-white text-xs font-semibold px-4 py-2 rounded-lg">
              + New pipeline
            </Link>
            <Link href="/dashboard/connections" className="border border-[#3A4664] text-[#C4CBDC] text-xs font-semibold px-4 py-2 rounded-lg">
              Manage connections
            </Link>
          </div>
        </div>

        {/* animated connector strip */}
        <div className="absolute right-0 top-0 bottom-0 w-[42%] hidden md:block opacity-90 z-10">
          <div className="relative h-full flex flex-col justify-center gap-8 pr-8">
            {[
              { icon: Database, label: "Postgres", color: "#5B9CF6" },
              { icon: Sheet, label: "Sheets", color: "#4ADE9C" },
              { icon: Globe, label: "REST API", color: "#F2A65A" },
            ].map((s, i) => (
              <div key={s.label} className="relative h-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-[#2A3752]" />
                </div>
                <div className="pipeline-dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}`, animationDelay: `${i * 1.1}s` }} />
                <div className="absolute left-0 -top-5 flex items-center gap-1.5 text-[10px] font-mono text-[#8B93AC]">
                  <s.icon size={11} style={{ color: s.color }} /> {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        <Stat label="Pipelines" value={pipelines.length} delay={0} />
        <Stat label="Active connections" value={activeConnections} delay={0.05} color="text-blue-600" />
        <Stat label="Successful runs" value={successCount} delay={0.1} color="text-emerald-600" />
        <Stat label="Failed runs" value={failCount} delay={0.15} color={failCount ? "text-red-500" : ""} />
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[15px] font-semibold">Recent pipeline runs</h3>
        <Link href="/dashboard/monitor" className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3 py-1.5 hover:border-[#2F6FED] flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden mb-7">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#FAFBFD] text-[11.5px] uppercase tracking-wide text-[#6B7385]">
              <th className="text-left px-4 py-2.5">Pipeline</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Rows in → out</th>
              <th className="text-left px-4 py-2.5">Duration</th>
              <th className="text-left px-4 py-2.5">Run time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-[#9AA1B2] py-6">Loading…</td></tr>
            ) : runs.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-[#9AA1B2] py-6">No runs yet — create a pipeline and hit Run.</td></tr>
            ) : (
              runs.map((r) => (
                <tr key={r._id} className="border-t border-[#F0F2F6] hover:bg-[#FAFBFD]">
                  <td className="px-4 py-2.5">{r.pipelineName}</td>
                  <td className="px-4 py-2.5"><Badge status={r.status} /></td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.rowsIn} → {r.rowsOut}</td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.durationMs}ms</td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[15px] font-semibold">Your pipelines</h3>
        <Link href="/dashboard/pipelines" className="text-xs font-semibold border border-[#E3E7EF] bg-white rounded-lg px-3 py-1.5 hover:border-[#2F6FED] flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {pipelines.slice(0, 3).map((p, i) => (
          <Link key={p._id} href={`/dashboard/designer/${p._id}`} className="animate-fade-up bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all block" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-center gap-2 mb-2">
              <Workflow size={14} className="text-[#2F6FED]" />
              <span className="text-[10px] font-mono uppercase tracking-wide text-[#9AA1B2]">{p.environment} · Mapping</span>
            </div>
            <h4 className="text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk'" }}>{p.name}</h4>
            <div className="text-xs font-mono text-[#9AA1B2] mt-1">{p.nodes.length} steps · {p.headers.length} columns</div>
          </Link>
        ))}
        <Link href="/dashboard/designer/new" className="border border-dashed border-[#E3E7EF] rounded-xl flex flex-col items-center justify-center py-9 text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] transition-colors">
          <div className="text-2xl mb-1">+</div>
          New pipeline
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, color, delay }: { label: string; value: number; color?: string; delay: number }) {
  return (
    <div className="animate-count bg-white border border-[#E3E7EF] rounded-xl p-5" style={{ animationDelay: `${delay}s` }}>
      <div className="text-[12px] text-[#6B7385] uppercase tracking-wide">{label}</div>
      <div className={`text-[28px] font-bold mt-2 ${color || ""}`} style={{ fontFamily: "'Space Grotesk'" }}>{value}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const ok = status === "success";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {ok ? "Success" : "Failed"}
    </span>
  );
}