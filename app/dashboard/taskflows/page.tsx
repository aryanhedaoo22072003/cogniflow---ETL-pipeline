"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListTree, Play } from "lucide-react";

export default function TaskflowsPage() {
  const [taskflows, setTaskflows] = useState<any[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  function load() {
    fetch("/api/taskflows").then((r) => r.json()).then((d) => setTaskflows(d.taskflows || []));
  }
  useEffect(() => { load(); }, []);

  async function runTaskflow(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setRunning(id);
    const res = await fetch(`/api/taskflows/${id}/run`, { method: "POST" });
    const data = await res.json();
    setResults((prev) => ({ ...prev, [id]: data }));
    setRunning(null);
  }

  return (
    <div className="p-7 overflow-y-auto">
      <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Taskflows</span></div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Taskflows</h1>
          <p className="text-[13.5px] text-[#6B7385]">Chain multiple pipelines on a visual canvas — build a mapping, then load a dimension, then run downstream jobs, all as one flow.</p>
        </div>
        <Link href="/dashboard/taskflows/new" className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-4 py-2">
          + New taskflow
        </Link>
      </div>

      {taskflows.length === 0 ? (
        <div className="text-sm text-[#9AA1B2] bg-white border border-[#E3E7EF] rounded-xl p-10 text-center">
          No taskflows yet. Create one to chain pipelines together on a canvas.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {taskflows.map((tf) => {
            const taskCount = (tf.nodes || []).filter((n: any) => n.type === "task").length;
            const result = results[tf._id];
            return (
              <Link key={tf._id} href={`/dashboard/taskflows/${tf._id}`} className="bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all block">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <ListTree size={15} className="text-[#7C6AE8]" />
                    <h4 className="text-[15px] font-semibold">{tf.name}</h4>
                  </div>
                  <button onClick={(e) => runTaskflow(e, tf._id)} disabled={running === tf._id} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50">
                    <Play size={11} /> {running === tf._id ? "Running…" : "Run"}
                  </button>
                </div>
                <div className="text-xs font-mono text-[#9AA1B2] mt-2">{taskCount} mapping task{taskCount !== 1 ? "s" : ""}</div>
                {result && (
                  <div className="mt-3 pt-3 border-t border-[#F0F2F6] text-[11.5px] font-mono">
                    Last run: <span className={result.status === "success" ? "text-emerald-600" : "text-red-500"}>{result.status}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}