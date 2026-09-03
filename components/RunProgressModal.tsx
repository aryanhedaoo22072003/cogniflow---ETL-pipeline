"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Loader2, X, Download, Database, Filter, Target, BarChart2, GitMerge, Zap } from "lucide-react";

interface StepProgress {
  step: number;
  label: string;
  status: "pending" | "running" | "success" | "failed";
  rowsIn?: number;
  rowsOut?: number;
  message?: string;
}

interface Props {
  pipelineId: string;
  pipelineName: string;
  nodes: any[];
  onClose: () => void;
  onComplete: (rows: any[], headers: string[], steps: any[]) => void;
}

function nodeIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("source")) return <Database size={14} className="text-blue-500" />;
  if (l.includes("filter")) return <Filter size={14} className="text-violet-500" />;
  if (l.includes("target")) return <Target size={14} className="text-emerald-500" />;
  if (l.includes("join") || l.includes("union")) return <GitMerge size={14} className="text-amber-500" />;
  return <BarChart2 size={14} className="text-[#7C6AE8]" />;
}

function fmt(ms: number) { return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`; }

export default function RunProgressModal({ pipelineId, pipelineName, nodes, onClose, onComplete }: Props) {
  const [steps, setSteps] = useState<StepProgress[]>(
    nodes.filter(n => n.type !== "source").map((n, i) => ({
      step: i + 1, label: n.label, status: "pending",
    }))
  );
  const [sourceRows, setSourceRows] = useState<number>(0);
  const [done, setDone] = useState(false);
  const [finalStatus, setFinalStatus] = useState<"success" | "failed" | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [rowsOut, setRowsOut] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/pipelines/${pipelineId}/run-stream`);
    eventSourceRef.current = es;

    es.addEventListener("start", (e) => {
      const data = JSON.parse(e.data);
      setSourceRows(0);
    });

    es.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      if (data.rowsOut !== null && data.rowsOut !== undefined && data.status !== "running") {
        setSourceRows(prev => data.rowsOut > prev ? data.rowsOut : prev);
      }
      setSteps(prev => prev.map(s =>
        s.label === data.label
          ? { ...s, status: data.status, rowsIn: data.rowsIn, rowsOut: data.rowsOut, message: data.message }
          : s
      ));
    });

    es.addEventListener("done", (e) => {
      const data = JSON.parse(e.data);
      setDone(true);
      setFinalStatus(data.status);
      setDurationMs(data.durationMs);
      setRowsOut(data.rowsOut);
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        ...(data.steps?.[i] ? { status: data.steps[i].ok ? "success" : "failed", rowsIn: data.steps[i].rowsIn, rowsOut: data.steps[i].rowsOut, message: data.steps[i].message } : {}),
      })));
      onComplete(data.rows || [], data.headers || [], data.steps || []);
      es.close();
    });

    es.addEventListener("error", (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setError(data.message);
      } catch {
        setError("Connection lost");
      }
      setDone(true);
      setFinalStatus("failed");
      es.close();
    });

    es.onerror = () => {
      if (!done) {
        setError("Stream connection lost");
        setDone(true);
        setFinalStatus("failed");
      }
      es.close();
    };

    return () => { es.close(); };
  }, [pipelineId]);

  const runningStep = steps.find(s => s.status === "running");
  const completedSteps = steps.filter(s => s.status === "success" || s.status === "failed").length;
  const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          done && finalStatus === "success" ? "bg-emerald-500" :
          done && finalStatus === "failed" ? "bg-red-500" :
          "bg-[#0B1220]"
        }`}>
          <div className="flex items-center gap-3">
            {done ? (
              finalStatus === "success"
                ? <CheckCircle2 size={20} className="text-white" />
                : <XCircle size={20} className="text-white" />
            ) : (
              <Loader2 size={20} className="text-white animate-spin" />
            )}
            <div>
              <div className="text-white font-semibold text-sm">{pipelineName}</div>
              <div className="text-white/60 text-[11px]">
                {done
                  ? finalStatus === "success"
                    ? `Completed in ${fmt(durationMs)} · ${rowsOut.toLocaleString()} rows`
                    : "Pipeline failed"
                  : runningStep
                    ? `Running ${runningStep.label}…`
                    : "Starting pipeline…"}
              </div>
            </div>
          </div>
          {done && (
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {!done && (
          <div className="h-1 bg-[#F0F2F6]">
            <div
              className="h-full bg-[#2F6FED] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Steps */}
        <div className="p-5 space-y-2 max-h-80 overflow-y-auto">
          {/* Source */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Database size={12} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-semibold">Source</div>
            </div>
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
          </div>

          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
              step.status === "running" ? "bg-[#2F6FED08] border border-[#2F6FED22]" :
              step.status === "failed" ? "bg-red-50 border border-red-100" : ""
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === "success" ? "bg-emerald-50" :
                step.status === "failed" ? "bg-red-50" :
                step.status === "running" ? "bg-[#2F6FED10]" :
                "bg-[#F4F6FA]"
              }`}>
                {nodeIcon(step.label)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold">{step.label}</div>
                {step.status !== "pending" && step.rowsIn !== undefined && (
                  <div className="text-[10.5px] font-mono text-[#9AA1B2]">
                    {step.rowsIn?.toLocaleString()} → {step.rowsOut?.toLocaleString() ?? "…"} rows
                    {step.message && step.status === "failed" && (
                      <span className="text-red-500 ml-1">· {step.message}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {step.status === "success" && <CheckCircle2 size={14} className="text-emerald-500" />}
                {step.status === "failed" && <XCircle size={14} className="text-red-500" />}
                {step.status === "running" && <Loader2 size={14} className="text-[#2F6FED] animate-spin" />}
                {step.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#E3E7EF]" />}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Footer */}
        {done && (
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={onClose}
              className="flex-1 border border-[#E3E7EF] text-sm font-semibold py-2.5 rounded-lg hover:border-[#2F6FED]">
              Close
            </button>
            {finalStatus === "success" && (
              <button onClick={onClose}
                className="flex-1 bg-[#2F6FED] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#245BD1] flex items-center justify-center gap-2">
                <Download size={14} /> View output
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}