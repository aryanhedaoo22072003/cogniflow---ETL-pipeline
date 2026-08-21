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
import { Database, Globe } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ pipelines: 0, connections: 0, runs: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/pipelines").then((r) => r.json()),
      fetch("/api/connections").then((r) => r.json()),
      fetch("/api/runs?limit=6").then((r) => r.json()),
    ]).then(([p, c, r]) => {
      setStats({
        pipelines: p.pipelines?.length || 0,
        connections: c.connections?.length || 0,
        runs: r.runs?.length || 0,
      });
      setRecent(r.runs || []);
    });
  }, []);

  return (
    <div className="p-7 overflow-y-auto bg-[#F4F6FA] min-h-full">

      {/* HERO */}
      <div className="relative bg-gradient-to-br from-[#0B1220] via-[#111A2E] to-[#1B2740] rounded-2xl p-7 mb-7 overflow-hidden">
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
            Welcome back
          </h1>
          <p className="text-[#B8C0D8] text-[13.5px] leading-relaxed">
            CogniFlow moves data from any source through enterprise-grade transforms — without writing a script for it.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href="/dashboard/designer/new" className="bg-[#2F6FED] text-white text-xs font-semibold px-4 py-2 rounded-lg">
              + New pipeline
            </Link>
            <Link href="/dashboard/templates" className="border border-[#3A4664] text-[#C4CBDC] text-xs font-semibold px-4 py-2 rounded-lg">
              Browse templates
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-[42%] hidden md:block opacity-90 z-10">
          <div className="relative h-full flex flex-col justify-center gap-8 pr-8">
            {[
              { icon: Database, label: "Postgres", color: "#5B9CF6" },
              { icon: Globe, label: "REST API", color: "#F2A65A" },
              { icon: Database, label: "MySQL", color: "#4ADE9C" },
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

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Pipelines", value: stats.pipelines, href: "/dashboard/pipelines" },
          { label: "Connections", value: stats.connections, href: "/dashboard/connections" },
          { label: "Runs", value: stats.runs, href: "/dashboard/monitor" },
        ].map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] transition-colors">
            <div className="text-[28px] font-bold text-[#1A2233]" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</div>
            <div className="text-[12.5px] text-[#6B7385] mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* RECENT RUNS */}
      {recent.length > 0 && (
        <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E3E7EF] flex items-center justify-between">
            <h3 className="text-[13.5px] font-semibold text-[#1A2233]">Recent runs</h3>
            <Link href="/dashboard/monitor" className="text-xs text-[#2F6FED] hover:underline">View all</Link>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#FAFBFD] text-[11px] uppercase tracking-wide text-[#6B7385]">
                <th className="text-left px-5 py-2.5">Pipeline</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="text-left px-5 py-2.5">Rows out</th>
                <th className="text-left px-5 py-2.5">Time</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r._id} className="border-t border-[#F0F2F6]">
                  <td className="px-5 py-2.5 text-[#1A2233] font-medium">{r.pipelineName}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${
                      r.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-[#9AA1B2]">{r.rowsOut} rows</td>
                  <td className="px-5 py-2.5 text-[#9AA1B2] text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recent.length === 0 && (
        <div className="bg-white border border-[#E3E7EF] rounded-xl p-10 text-center">
          <p className="text-[#9AA1B2] text-sm mb-3">No runs yet — build a pipeline and hit Run to see results here.</p>
          <Link href="/dashboard/designer/new" className="text-xs font-semibold text-[#2F6FED] hover:underline">
            Create your first pipeline →
          </Link>
        </div>
      )}
    </div>
  );
}