"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

export default function MonitorPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson<{ runs: any[] }>("/api/runs?limit=100").then((r) => {
      setRuns(r.data?.runs || []);
      setLoading(false);
    });
  }, []);

  function downloadLog(run: any) {
    const lines = [
      `Pipeline: ${run.pipelineName}`,
      `Status: ${run.status}`,
      `Environment: ${run.environment}`,
      `Run time: ${new Date(run.createdAt).toLocaleString()}`,
      `Rows: ${run.rowsIn} → ${run.rowsOut}`,
      `Duration: ${run.durationMs}ms`,
      "",
      "Steps:",
      ...run.steps.map((s: any, i: number) => `  ${i + 1}. [${s.ok ? "OK" : "FAIL"}] ${s.label} — ${s.message} (${s.rowsIn} → ${s.rowsOut} rows)`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.pipelineName.replace(/\s+/g, "_")}_${new Date(run.createdAt).toISOString().slice(0, 19)}.log.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-7 overflow-y-auto">
      <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Monitor</span></div>
      <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Monitor</h1>
      <p className="text-[13.5px] text-[#6B7385] mb-6">Execution history across all pipelines in this environment.</p>

      <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#FAFBFD] text-[11.5px] uppercase tracking-wide text-[#6B7385]">
              <th className="text-left px-4 py-2.5">Pipeline</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Steps</th>
              <th className="text-left px-4 py-2.5">Rows in → out</th>
              <th className="text-left px-4 py-2.5">Duration</th>
              <th className="text-left px-4 py-2.5">Run time</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-[#9AA1B2] py-6">Loading…</td></tr>
            ) : runs.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-[#9AA1B2] py-6">No executions yet.</td></tr>
            ) : (
              runs.map((r) => (
                <tr key={r._id} className="border-t border-[#F0F2F6] hover:bg-[#FAFBFD]">
                  <td className="px-4 py-2.5">{r.pipelineName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${r.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {r.status === "success" ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.steps?.length ?? 0}</td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.rowsIn} → {r.rowsOut}</td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{r.durationMs}ms</td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => downloadLog(r)} className="text-xs font-semibold text-[#2F6FED] flex items-center gap-1 ml-auto hover:underline">
                      <Download size={12} /> Log
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}