// "use client";

// import { useEffect, useState } from "react";
// import { Clock3, Plus, X, Play, Info, Globe2 } from "lucide-react";
// import { COMMON_TIMEZONES } from "@/lib/scheduling";

// export default function SchedulesPage() {
//   const [schedules, setSchedules] = useState<any[]>([]);
//   const [pipelines, setPipelines] = useState<any[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [pipelineId, setPipelineId] = useState("");
//   const [scheduleType, setScheduleType] = useState<"interval" | "daily">("daily");
//   const [intervalMinutes, setIntervalMinutes] = useState(60);
//   const [timeOfDay, setTimeOfDay] = useState("09:00");
//   const [timezone, setTimezone] = useState("Asia/Kolkata");
//   const [runningId, setRunningId] = useState<string | null>(null);

//   function load() {
//     fetch("/api/schedules").then((r) => r.json()).then((d) => setSchedules(d.schedules || []));
//     fetch("/api/pipelines").then((r) => r.json()).then((d) => setPipelines(d.pipelines || []));
//   }
//   useEffect(() => { load(); }, []);

//   async function createSchedule() {
//     if (!pipelineId) return;
//     await fetch("/api/schedules", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         pipelineId,
//         scheduleType,
//         intervalMinutes,
//         timeOfDay,
//         timezone,
//       }),
//     });
//     setShowModal(false);
//     setPipelineId("");
//     load();
//   }

//   async function toggleEnabled(id: string, enabled: boolean) {
//     await fetch(`/api/schedules/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ enabled }),
//     });
//     load();
//   }

//   async function deleteSchedule(id: string) {
//     await fetch(`/api/schedules/${id}`, { method: "DELETE" });
//     load();
//   }

//   async function runNow(id: string) {
//     setRunningId(id);
//     await fetch(`/api/schedules/${id}/run-now`, { method: "POST" });
//     setRunningId(null);
//     load();
//   }

//   function scheduleSummary(s: any) {
//     if (s.scheduleType === "daily") {
//       const zoneLabel = COMMON_TIMEZONES.find((z) => z.value === s.timezone)?.label || s.timezone;
//       return `Daily at ${s.timeOfDay} — ${zoneLabel}`;
//     }
//     return `Every ${s.intervalMinutes} min`;
//   }

//   return (
//     <div className="p-7 overflow-y-auto">
//       <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Schedules</span></div>
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Schedules</h1>
//           <p className="text-[13.5px] text-[#6B7385]">Run a pipeline automatically — daily at a set time in a region, or on a fixed interval.</p>
//         </div>
//         <button onClick={() => setShowModal(true)} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-4 py-2 flex items-center gap-1.5">
//           <Plus size={14} /> New schedule
//         </button>
//       </div>

//       <div className="flex items-start gap-2.5 bg-[#EFF4FF] border border-[#D6E4FF] rounded-lg px-4 py-3 mb-6 text-[12.5px] text-[#2F4E8C]">
//         <Info size={15} className="mt-0.5 flex-shrink-0" />
//         <div>
//           Schedules only actually fire when something calls <code className="bg-white/60 px-1 rounded">GET /api/cron/run-due</code> —
//           Next.js has no background timer of its own. If you deploy to Vercel, add a Vercel Cron entry pointing at that route.
//           Anywhere else, use a free service like <a href="https://cron-job.org" target="_blank" className="underline">cron-job.org</a> to
//           hit it every 5 minutes. Until then, use <b>Run now</b> below to trigger manually.
//         </div>
//       </div>

//       {schedules.length === 0 ? (
//         <div className="text-sm text-[#9AA1B2] bg-white border border-[#E3E7EF] rounded-xl p-10 text-center">No schedules yet.</div>
//       ) : (
//         <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
//           <table className="w-full text-[13px]">
//             <thead>
//               <tr className="bg-[#FAFBFD] text-[11.5px] uppercase tracking-wide text-[#6B7385]">
//                 <th className="text-left px-4 py-2.5">Pipeline</th>
//                 <th className="text-left px-4 py-2.5">Schedule</th>
//                 <th className="text-left px-4 py-2.5">Next run</th>
//                 <th className="text-left px-4 py-2.5">Last status</th>
//                 <th className="text-left px-4 py-2.5">Enabled</th>
//                 <th className="px-4 py-2.5"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {schedules.map((s) => (
//                 <tr key={s._id} className="border-t border-[#F0F2F6]">
//                   <td className="px-4 py-2.5 flex items-center gap-2"><Clock3 size={13} className="text-[#9AA1B2]" />{s.pipelineName}</td>
//                   <td className="px-4 py-2.5 font-mono text-[#6B7385] text-xs">{scheduleSummary(s)}</td>
//                   <td className="px-4 py-2.5 font-mono text-[#9AA1B2] text-xs">{new Date(s.nextRunAt).toLocaleString()}</td>
//                   <td className="px-4 py-2.5">
//                     <span className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${s.lastStatus === "success" ? "bg-emerald-50 text-emerald-600" : s.lastStatus === "failed" ? "bg-red-50 text-red-500" : "bg-[#F4F6FA] text-[#9AA1B2]"}`}>
//                       {s.lastStatus}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2.5">
//                     <button onClick={() => toggleEnabled(s._id, !s.enabled)} className={`w-9 h-5 rounded-full relative transition-colors ${s.enabled ? "bg-[#2F6FED]" : "bg-[#E3E7EF]"}`}>
//                       <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${s.enabled ? "left-[18px]" : "left-0.5"}`} />
//                     </button>
//                   </td>
//                   <td className="px-4 py-2.5 text-right">
//                     <button onClick={() => runNow(s._id)} disabled={runningId === s._id} className="text-xs font-semibold text-[#2F6FED] flex items-center gap-1 ml-auto hover:underline disabled:opacity-50">
//                       <Play size={11} /> {runningId === s._id ? "Running…" : "Run now"}
//                     </button>
//                     <button onClick={() => deleteSchedule(s._id)} className="text-[11px] text-[#9AA1B2] hover:text-red-500 mt-1 block ml-auto">Remove</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl p-6 w-[420px]">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-[16px] font-semibold">New schedule</h3>
//               <button onClick={() => setShowModal(false)}><X size={16} className="text-[#9AA1B2]" /></button>
//             </div>
//             <div className="mb-3">
//               <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Pipeline</label>
//               <select className="w-full border border-[#E3E7EF] rounded px-2.5 py-2 text-sm" value={pipelineId} onChange={(e) => setPipelineId(e.target.value)}>
//                 <option value="">Select a pipeline…</option>
//                 {pipelines.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
//               </select>
//             </div>

//             <div className="flex gap-1.5 mb-3">
//               <button onClick={() => setScheduleType("daily")} className={`flex-1 text-xs py-1.5 rounded border ${scheduleType === "daily" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Daily at a time</button>
//               <button onClick={() => setScheduleType("interval")} className={`flex-1 text-xs py-1.5 rounded border ${scheduleType === "interval" ? "border-[#2F6FED] bg-[#2F6FED14] text-[#2F6FED]" : "border-[#E3E7EF]"}`}>Fixed interval</button>
//             </div>

//             {scheduleType === "daily" ? (
//               <>
//                 <div className="mb-3">
//                   <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Time of day</label>
//                   <input type="time" className="w-full border border-[#E3E7EF] rounded px-2.5 py-2 text-sm" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
//                 </div>
//                 <div className="mb-3">
//                   <label className="block text-[11px] font-mono text-[#6B7385] mb-1 flex items-center gap-1.5"><Globe2 size={11} /> Region / timezone</label>
//                   <select className="w-full border border-[#E3E7EF] rounded px-2.5 py-2 text-sm" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
//                     {COMMON_TIMEZONES.map((z) => <option key={z.value} value={z.value}>{z.label} ({z.value})</option>)}
//                   </select>
//                 </div>
//               </>
//             ) : (
//               <div className="mb-3">
//                 <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Run every (minutes)</label>
//                 <input type="number" min={5} className="w-full border border-[#E3E7EF] rounded px-2.5 py-2 text-sm" value={intervalMinutes} onChange={(e) => setIntervalMinutes(Number(e.target.value))} />
//               </div>
//             )}

//             <div className="flex justify-end gap-2 mt-4">
//               <button onClick={() => setShowModal(false)} className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-3.5 py-2">Cancel</button>
//               <button onClick={createSchedule} disabled={!pipelineId} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 disabled:opacity-50">Create</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { Clock3, Plus, X, Play, Info, Globe2, Workflow, ListTree } from "lucide-react";
import { COMMON_TIMEZONES } from "@/lib/scheduling";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [taskflows, setTaskflows] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [targetType, setTargetType] = useState<"pipeline" | "taskflow">("pipeline");
  const [pipelineId, setPipelineId] = useState("");
  const [taskflowId, setTaskflowId] = useState("");
  const [scheduleType, setScheduleType] = useState<"interval" | "daily">("daily");
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [runningId, setRunningId] = useState<string | null>(null);

  function load() {
    fetch("/api/schedules").then(r => r.json()).then(d => setSchedules(d.schedules || []));
    fetch("/api/pipelines").then(r => r.json()).then(d => setPipelines(d.pipelines || []));
    fetch("/api/taskflows").then(r => r.json()).then(d => setTaskflows(d.taskflows || [])).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function createSchedule() {
    const id = targetType === "pipeline" ? pipelineId : taskflowId;
    if (!id) return;
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pipelineId: targetType === "pipeline" ? pipelineId : undefined,
        taskflowId: targetType === "taskflow" ? taskflowId : undefined,
        scheduleType,
        intervalMinutes,
        timeOfDay,
        timezone,
      }),
    });
    setShowModal(false);
    setPipelineId("");
    setTaskflowId("");
    load();
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    await fetch(`/api/schedules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    load();
  }

  async function deleteSchedule(id: string) {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    load();
  }

  async function runNow(scheduleId: string, pipelineId?: string, taskflowId?: string) {
    setRunningId(scheduleId);
    try {
      if (pipelineId) {
        await fetch(`/api/pipelines/${pipelineId}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      } else if (taskflowId) {
        await fetch(`/api/taskflows/${taskflowId}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      }
    } catch {}
    setRunningId(null);
    load();
  }

  const getName = (s: any) => {
    if (s.taskflowId) {
      const tf = taskflows.find(t => t._id === s.taskflowId);
      return tf?.name || s.taskflowId;
    }
    const p = pipelines.find(p => p._id === s.pipelineId);
    return p?.name || s.pipelineId;
  };

  const selectCls = "w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F6FED] bg-white";
  const labelCls = "block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5";

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2233] mb-1">Schedules</h1>
          <p className="text-[13px] text-[#6B7385]">Run pipelines and taskflows automatically on a schedule.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#2F6FED] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#245BD1]">
          <Plus size={15} /> New schedule
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[#2F6FED08] border border-[#2F6FED22] rounded-xl p-4 mb-6 flex gap-3">
        <Info size={15} className="text-[#2F6FED] flex-shrink-0 mt-0.5" />
        <div className="text-[12.5px] text-[#6B7385] leading-relaxed">
          Schedules are triggered by calling <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E3E7EF] text-[#2F6FED]">POST /api/schedules/run</code> with your <code className="font-mono bg-white px-1 rounded border border-[#E3E7EF]">CRON_SECRET</code>.
          Set this up as a cron job, GitHub Action, or Vercel cron. Email alerts fire automatically on each run.
        </div>
      </div>

      {/* Schedule list */}
      {schedules.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E3E7EF] rounded-xl p-12 text-center">
          <Clock3 size={32} className="text-[#E3E7EF] mx-auto mb-3" />
          <p className="text-sm text-[#9AA1B2] mb-4">No schedules yet.</p>
          <button onClick={() => setShowModal(true)} className="text-sm font-semibold text-[#2F6FED] hover:underline">+ Create one</button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => {
            const isTaskflow = !!s.taskflowId;
            return (
              <div key={s._id} className="bg-white border border-[#E3E7EF] rounded-xl px-5 py-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isTaskflow ? "bg-[#7C6AE814]" : "bg-[#2F6FED14]"}`}>
                  {isTaskflow ? <ListTree size={16} className="text-[#7C6AE8]" /> : <Workflow size={16} className="text-[#2F6FED]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold truncate">{getName(s)}</div>
                  <div className="text-[11.5px] text-[#9AA1B2] mt-0.5 flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isTaskflow ? "bg-[#7C6AE814] text-[#7C6AE8]" : "bg-[#2F6FED14] text-[#2F6FED]"}`}>
                      {isTaskflow ? "taskflow" : "pipeline"}
                    </span>
                    <span className="flex items-center gap-1"><Clock3 size={10} /> {s.cron}</span>
                    <span className="flex items-center gap-1"><Globe2 size={10} /> {s.timezone}</span>
                    {s.lastRunAt && <span>Last: {new Date(s.lastRunAt).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => runNow(s._id, s.pipelineId, s.taskflowId)}
                    disabled={runningId === s._id}
                    title="Run now"
                    className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-40"
                  >
                    {runningId === s._id ? <span className="text-[10px]">…</span> : <Play size={13} />}
                  </button>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleEnabled(s._id, !s.enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${s.enabled ? "bg-[#2F6FED]" : "bg-[#E3E7EF]"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => deleteSchedule(s._id)} className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] rounded-lg text-[#9AA1B2] hover:border-red-400 hover:text-red-500">
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cron command */}
      {schedules.length > 0 && (
        <div className="mt-6 bg-[#0B1220] rounded-xl p-4">
          <div className="text-[11px] font-mono text-[#5EEAD4] mb-2">Trigger command (add to cron or GitHub Actions)</div>
          <code className="text-[12px] font-mono text-[#C4CBDC] break-all">
            curl -X POST http://localhost:3000/api/schedules/run -H "Authorization: Bearer $CRON_SECRET"
          </code>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold">New schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-[#9AA1B2] hover:text-[#1A2233]"><X size={18} /></button>
            </div>

            {/* Target type tabs */}
            <div className="mb-4">
              <label className={labelCls}>Schedule type</label>
              <div className="flex gap-2">
                {[
                  { value: "pipeline", label: "Pipeline", icon: Workflow },
                  { value: "taskflow", label: "Taskflow", icon: ListTree },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setTargetType(opt.value as any)}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 rounded-lg border transition-colors ${targetType === opt.value ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385]"}`}>
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline or Taskflow picker */}
            {targetType === "pipeline" ? (
              <div className="mb-4">
                <label className={labelCls}>Pipeline ({pipelines.length} available)</label>
                <select className={selectCls} value={pipelineId} onChange={e => setPipelineId(e.target.value)}>
                  <option value="">Select a pipeline…</option>
                  {pipelines.map(p => (
                    <option key={p._id} value={p._id}>{p.name} [{p.environment}]</option>
                  ))}
                </select>
                {pipelines.length === 0 && <p className="text-[11px] text-[#9AA1B2] mt-1">No pipelines yet — create one in the Designer.</p>}
              </div>
            ) : (
              <div className="mb-4">
                <label className={labelCls}>Taskflow ({taskflows.length} available)</label>
                <select className={selectCls} value={taskflowId} onChange={e => setTaskflowId(e.target.value)}>
                  <option value="">Select a taskflow…</option>
                  {taskflows.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
                {taskflows.length === 0 && <p className="text-[11px] text-[#9AA1B2] mt-1">No taskflows yet — create one in Taskflows.</p>}
              </div>
            )}

            {/* Schedule frequency */}
            <div className="mb-4">
              <label className={labelCls}>Frequency</label>
              <div className="flex gap-2">
                {[{ value: "daily", label: "Daily" }, { value: "interval", label: "Every N minutes" }].map(opt => (
                  <button key={opt.value} onClick={() => setScheduleType(opt.value as any)}
                    className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${scheduleType === opt.value ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385]"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {scheduleType === "daily" ? (
              <div className="mb-4">
                <label className={labelCls}>Time of day</label>
                <input type="time" className={selectCls} value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} />
              </div>
            ) : (
              <div className="mb-4">
                <label className={labelCls}>Every (minutes)</label>
                <input type="number" min={5} max={1440} className={selectCls} value={intervalMinutes} onChange={e => setIntervalMinutes(Number(e.target.value))} />
              </div>
            )}

            <div className="mb-6">
              <label className={labelCls}>Timezone</label>
              <select className={selectCls} value={timezone} onChange={e => setTimezone(e.target.value)}>
                {COMMON_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-[#E3E7EF] text-sm font-semibold py-2.5 rounded-lg hover:border-[#2F6FED]">Cancel</button>
              <button onClick={createSchedule} disabled={targetType === "pipeline" ? !pipelineId : !taskflowId}
                className="flex-1 bg-[#2F6FED] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#245BD1] disabled:opacity-40">
                Create schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
