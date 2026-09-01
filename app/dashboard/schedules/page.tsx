"use client";
import { useEffect, useState, useCallback } from "react";
import { Clock3, Plus, X, Play, Globe2, Workflow, ListTree, Info } from "lucide-react";

const TIMEZONES = [
  "Asia/Kolkata", "UTC", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles", "Europe/London",
  "Europe/Paris", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [taskflows, setTaskflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [targetType, setTargetType] = useState<"pipeline" | "taskflow">("pipeline");
  const [pipelineId, setPipelineId] = useState("");
  const [taskflowId, setTaskflowId] = useState("");
  const [scheduleType, setScheduleType] = useState<"daily" | "interval">("daily");
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [runningId, setRunningId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [sRes, pRes, tRes] = await Promise.all([
      fetch("/api/schedules").then(r => r.json()).catch(() => ({ schedules: [] })),
      fetch("/api/pipelines").then(r => r.json()).catch(() => ({ pipelines: [] })),
      fetch("/api/taskflows").then(r => r.json()).catch(() => ({ taskflows: [] })),
    ]);
    setSchedules(sRes.schedules || []);
    setPipelines(pRes.pipelines || []);
    setTaskflows(tRes.taskflows || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createSchedule() {
    const id = targetType === "pipeline" ? pipelineId : taskflowId;
    if (!id) return;
    setCreating(true);
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pipelineId: targetType === "pipeline" ? pipelineId : undefined,
        taskflowId: targetType === "taskflow" ? taskflowId : undefined,
        scheduleType, intervalMinutes, timeOfDay, timezone,
      }),
    });
    setCreating(false);
    setShowModal(false);
    setPipelineId(""); setTaskflowId("");
    load();
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    await fetch(`/api/schedules/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
    setSchedules(prev => prev.map(s => s._id === id ? { ...s, enabled } : s));
  }

  async function deleteSchedule(id: string) {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    setSchedules(prev => prev.filter(s => s._id !== id));
  }

  // async function runNow(scheduleId: string, pid?: string, tid?: string) {
  //   setRunningId(scheduleId);
  //   try {
  //     if (pid) await fetch(`/api/pipelines/${pid}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  //     else if (tid) await fetch(`/api/taskflows/${tid}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  //   } catch {}
  //   setRunningId(null);
  //   load();
  // }

//   async function runNow(scheduleId: string, pid?: string, tid?: string) {
//   setRunningId(scheduleId);
//   try {
//     // Use the full schedule runner so email alerts fire
//     await fetch("/api/schedules/run", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": "Bearer cogniflow-secret-2026",
//       },
//     });
//   } catch {}
//   setRunningId(null);
//   load();
// }

async function runNow(scheduleId: string, pid?: string, tid?: string) {
  setRunningId(scheduleId);
  try {
    if (pid) {
      await fetch(`/api/pipelines/${pid}/run?sendEmail=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } else if (tid) {
      await fetch(`/api/taskflows/${tid}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    }
  } catch {}
  setRunningId(null);
  load();
}

  const getName = (s: any) => {
    if (s.taskflowId) return taskflows.find(t => t._id === s.taskflowId)?.name || s.taskflowId;
    return s.pipelineName || pipelines.find(p => p._id === s.pipelineId)?.name || s.pipelineId;
  };

  const sel = "w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F6FED] bg-white";
  const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5";

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2233] mb-1">Schedules</h1>
          <p className="text-[13px] text-[#6B7385]">Run pipelines and taskflows automatically.</p>
        </div>
        <button onClick={() => { setShowModal(true); load(); }}
          className="flex items-center gap-2 bg-[#2F6FED] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#245BD1]">
          <Plus size={15} /> New schedule
        </button>
      </div>

      <div className="bg-[#2F6FED08] border border-[#2F6FED22] rounded-xl p-4 mb-6 flex gap-3">
        <Info size={14} className="text-[#2F6FED] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#6B7385]">
          Trigger schedules by calling <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E3E7EF] text-[#2F6FED]">POST /api/schedules/run</code> with your <code className="font-mono bg-white px-1 rounded border border-[#E3E7EF]">CRON_SECRET</code>. Email alerts fire automatically on each run.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-[#9AA1B2] text-center py-12">Loading…</div>
      ) : schedules.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E3E7EF] rounded-xl p-12 text-center">
          <Clock3 size={28} className="text-[#E3E7EF] mx-auto mb-3" />
          <p className="text-sm text-[#9AA1B2] mb-3">No schedules yet.</p>
          <button onClick={() => { setShowModal(true); load(); }} className="text-sm font-semibold text-[#2F6FED] hover:underline">+ Create one</button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => {
            const isTf = !!s.taskflowId;
            return (
              <div key={s._id} className="bg-white border border-[#E3E7EF] rounded-xl px-5 py-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isTf ? "bg-[#7C6AE814]" : "bg-[#2F6FED14]"}`}>
                  {isTf ? <ListTree size={15} className="text-[#7C6AE8]" /> : <Workflow size={15} className="text-[#2F6FED]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold truncate">{getName(s)}</div>
                  <div className="text-[11px] text-[#9AA1B2] mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isTf ? "bg-[#7C6AE814] text-[#7C6AE8]" : "bg-[#2F6FED14] text-[#2F6FED]"}`}>
                      {isTf ? "taskflow" : "pipeline"}
                    </span>
                    <span className="flex items-center gap-1"><Clock3 size={9} /> {s.scheduleType === "interval" ? `every ${s.intervalMinutes}m` : `daily ${s.timeOfDay}`}</span>
                    <span className="flex items-center gap-1"><Globe2 size={9} /> {s.timezone}</span>
                    {s.lastRunAt && <span>Last: {new Date(s.lastRunAt).toLocaleString("en-IN")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => runNow(s._id, s.pipelineId, s.taskflowId)} disabled={runningId === s._id} title="Run now"
                    className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] rounded-lg text-[#6B7385] hover:border-[#2F6FED] hover:text-[#2F6FED] disabled:opacity-40">
                    {runningId === s._id ? <span className="text-[10px]">…</span> : <Play size={12} />}
                  </button>
                  <button onClick={() => toggleEnabled(s._id, !s.enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${s.enabled ? "bg-[#2F6FED]" : "bg-[#E3E7EF]"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => deleteSchedule(s._id)}
                    className="w-8 h-8 flex items-center justify-center border border-[#E3E7EF] rounded-lg text-[#9AA1B2] hover:border-red-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {schedules.length > 0 && (
        <div className="mt-6 bg-[#0B1220] rounded-xl p-4">
          <div className="text-[11px] font-mono text-[#5EEAD4] mb-2">Trigger command</div>
          <code className="text-[11px] font-mono text-[#C4CBDC] break-all">
            curl -X POST http://localhost:3000/api/schedules/run -H "Authorization: Bearer $CRON_SECRET"
          </code>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold">New schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-[#9AA1B2] hover:text-[#1A2233]"><X size={18} /></button>
            </div>

            <div className="mb-4">
              <label className={lbl}>Schedule type</label>
              <div className="flex gap-2">
                {[{ v: "pipeline", label: "Pipeline", icon: Workflow }, { v: "taskflow", label: "Taskflow", icon: ListTree }].map(opt => (
                  <button key={opt.v} onClick={() => setTargetType(opt.v as any)}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 rounded-lg border transition-colors ${targetType === opt.v ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"}`}>
                    <opt.icon size={13} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {targetType === "pipeline" ? (
              <div className="mb-4">
                <label className={lbl}>Pipeline ({pipelines.length} available)</label>
                <select className={sel} value={pipelineId} onChange={e => setPipelineId(e.target.value)}>
                  <option value="">Select a pipeline…</option>
                  {pipelines.map(p => <option key={p._id} value={p._id}>{p.name} [{p.environment}]</option>)}
                </select>
                {pipelines.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1 bg-amber-50 px-2 py-1.5 rounded">
                    No pipelines loaded — try closing and reopening this modal, or check the Data Integration page.
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <label className={lbl}>Taskflow ({taskflows.length} available)</label>
                <select className={sel} value={taskflowId} onChange={e => setTaskflowId(e.target.value)}>
                  <option value="">Select a taskflow…</option>
                  {taskflows.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className={lbl}>Frequency</label>
              <div className="flex gap-2">
                {[{ v: "daily", label: "Daily" }, { v: "interval", label: "Every N minutes" }].map(opt => (
                  <button key={opt.v} onClick={() => setScheduleType(opt.v as any)}
                    className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${scheduleType === opt.v ? "border-[#2F6FED] bg-[#2F6FED10] text-[#2F6FED]" : "border-[#E3E7EF] text-[#6B7385] hover:border-[#2F6FED]"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {scheduleType === "daily" ? (
              <div className="mb-4">
                <label className={lbl}>Time of day</label>
                <input type="time" className={sel} value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} />
              </div>
            ) : (
              <div className="mb-4">
                <label className={lbl}>Every (minutes)</label>
                <input type="number" min={5} max={1440} className={sel} value={intervalMinutes} onChange={e => setIntervalMinutes(Number(e.target.value))} />
              </div>
            )}

            <div className="mb-6">
              <label className={lbl}>Timezone</label>
              <select className={sel} value={timezone} onChange={e => setTimezone(e.target.value)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-[#E3E7EF] text-sm font-semibold py-2.5 rounded-lg hover:border-[#2F6FED]">Cancel</button>
              <button onClick={createSchedule} disabled={creating || (targetType === "pipeline" ? !pipelineId : !taskflowId)}
                className="flex-1 bg-[#2F6FED] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#245BD1] disabled:opacity-40">
                {creating ? "Creating…" : "Create schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}