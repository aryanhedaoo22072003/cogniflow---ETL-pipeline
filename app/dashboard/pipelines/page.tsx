// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Workflow, Search, GitCompareArrows } from "lucide-react";

// export default function PipelinesPage() {
//   const router = useRouter();
//   const [pipelines, setPipelines] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState("");

//   useEffect(() => {
//     fetch("/api/pipelines")
//       .then((r) => r.json())
//       .then((d) => {
//         setPipelines(d.pipelines || []);
//         setLoading(false);
//       });
//   }, []);

//   const filtered = pipelines.filter((p) =>
//     p.name.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <div className="p-7 overflow-y-auto bg-[#F4F6FA] dark:bg-[#0E0F1A] min-h-full">
//       <div className="text-[12px] text-[#9AA1B2] mb-2">
//         Home <span className="mx-1">›</span>
//         <span className="text-[#6B7385] dark:text-[#8B8FB0]">Data Integration</span>
//       </div>

//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h1 className="text-[22px] font-semibold mb-1 text-[#1A2233] dark:text-[#EAEBF5]" style={{ fontFamily: "'Space Grotesk'" }}>
//             Data Integration
//           </h1>
//           <p className="text-[13.5px] text-[#6B7385] dark:text-[#8B8FB0]">
//             Design, save, and run no-code ETL pipelines.
//           </p>
//         </div>
//         <div className="relative">
//           <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AA1B2]" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search pipelines…"
//             className="pl-8 pr-3 py-2 text-xs border border-[#E3E7EF] dark:border-[#2A2E4A] rounded-lg w-56 bg-white dark:bg-[#161829] text-[#1A2233] dark:text-[#EAEBF5] focus:outline-none focus:border-[#2F6FED]"
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-[#9AA1B2] text-sm">Loading pipelines…</div>
//       ) : (
//         <div className="grid grid-cols-3 gap-4">
//           {filtered.map((p) => (
//             <Link
//               key={p._id}
//               href={`/dashboard/designer/${p._id}`}
//               className="bg-white dark:bg-[#161829] border border-[#E3E7EF] dark:border-[#2A2E4A] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all block"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-1.5">
//                   <Workflow size={14} className="text-[#2F6FED]" />
//                   <span className="text-[10px] font-mono uppercase tracking-wide text-[#9AA1B2]">Mapping</span>
//                 </div>
//                 <span className="text-[10px] font-mono bg-[#F4F6FA] dark:bg-[#1B2740] text-[#6B7385] dark:text-[#C4CBDC] px-2 py-0.5 rounded">
//                   {p.environment}
//                 </span>
//               </div>
//               <h4 className="text-[15px] font-semibold text-[#1A2233] dark:text-[#EAEBF5]" style={{ fontFamily: "'Space Grotesk'" }}>
//                 {p.name}
//               </h4>
//               <div className="text-xs font-mono text-[#9AA1B2] mt-1">
//                 {p.nodes.length} steps · {p.headers.length} columns
//               </div>
//               <div className="text-[11px] text-[#9AA1B2] mt-2">
//                 Updated {new Date(p.updatedAt).toLocaleDateString()}
//               </div>
//               {p.promotedFrom && (
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     router.push(`/dashboard/pipelines/diff/${p._id}`);
//                   }}
//                   className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D98A1E] mt-2 hover:underline"
//                 >
//                   <GitCompareArrows size={12} /> Promoted — view diff vs source
//                 </button>
//               )}
//               <div className="flex flex-wrap gap-1.5 mt-3">
//                 {p.nodes.slice(0, 4).map((n: any, i: number) => (
//                   <span key={i} className="text-[10.5px] bg-[#2F6FED14] text-[#2F6FED] px-2 py-0.5 rounded-full">
//                     {n.label}
//                   </span>
//                 ))}
//                 {p.nodes.length > 4 && (
//                   <span className="text-[10.5px] bg-[#F4F6FA] dark:bg-[#1B2740] text-[#9AA1B2] px-2 py-0.5 rounded-full">
//                     +{p.nodes.length - 4}
//                   </span>
//                 )}
//               </div>
//             </Link>
//           ))}

//           <Link
//             href="/dashboard/designer/new"
//             className="border border-dashed border-[#E3E7EF] dark:border-[#2A2E4A] rounded-xl flex flex-col items-center justify-center py-9 text-[#6B7385] dark:text-[#8B8FB0] hover:border-[#2F6FED] hover:text-[#2F6FED] transition-colors"
//           >
//             <div className="text-2xl mb-1">+</div>
//             New pipeline
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
import { Workflow, Search, GitCompareArrows } from "lucide-react";

export default function PipelinesPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/pipelines")
      .then((r) => r.json())
      .then((d) => { setPipelines(d.pipelines || []); setLoading(false); });
  }, []);

  const filtered = pipelines.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-7 overflow-y-auto">
      <div className="text-[12px] text-[#9AA1B2] mb-2">
        Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Data Integration</span>
      </div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Data Integration</h1>
          <p className="text-[13.5px] text-[#6B7385]">Design, save, and run no-code ETL pipelines.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AA1B2]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pipelines…"
            className="pl-8 pr-3 py-2 text-xs border border-[#E3E7EF] rounded-lg w-56 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-[#9AA1B2] text-sm">Loading pipelines…</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p._id} href={`/dashboard/designer/${p._id}`}
              className="bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all block">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Workflow size={14} className="text-[#2F6FED]" />
                  <span className="text-[10px] font-mono uppercase tracking-wide text-[#9AA1B2]">Mapping</span>
                </div>
                <span className="text-[10px] font-mono bg-[#F4F6FA] text-[#6B7385] px-2 py-0.5 rounded">{p.environment}</span>
              </div>
              <h4 className="text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk'" }}>{p.name}</h4>
              <div className="text-xs font-mono text-[#9AA1B2] mt-1">{p.nodes.length} steps · {p.headers.length} columns</div>
              <div className="text-[11px] text-[#9AA1B2] mt-2">Updated {new Date(p.updatedAt).toLocaleDateString()}</div>
              {p.promotedFrom && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/dashboard/pipelines/diff/${p._id}`); }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D98A1E] mt-2 hover:underline">
                  <GitCompareArrows size={12} /> Promoted — view diff vs source
                </button>
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.nodes.slice(0, 4).map((n: any, i: number) => (
                  <span key={i} className="text-[10.5px] bg-[#2F6FED14] text-[#2F6FED] px-2 py-0.5 rounded-full">{n.label}</span>
                ))}
                {p.nodes.length > 4 && (
                  <span className="text-[10.5px] bg-[#F4F6FA] text-[#9AA1B2] px-2 py-0.5 rounded-full">+{p.nodes.length - 4}</span>
                )}
              </div>
            </Link>
          ))}
          <Link href="/dashboard/designer/new"
            className="border border-dashed border-[#E3E7EF] rounded-xl flex flex-col items-center justify-center py-9 text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] transition-colors">
            <div className="text-2xl mb-1">+</div>
            New pipeline
          </Link>
        </div>
      )}
    </div>
  );
}