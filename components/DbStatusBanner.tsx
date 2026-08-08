"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DbStatusBanner() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.ok ? "ok" : "down");
        if (!d.ok) setError(d.error || "");
      })
      .catch(() => setStatus("down"));
  }, []);

  if (status !== "down" || dismissed) return null;

  return (
    <div className="flex items-start gap-3 bg-[#FFF7E8] border-b border-[#F2D9A8] px-6 py-3 text-[13px] text-[#7A5B12]">
      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <b>Can't reach MongoDB.</b> Check that <code className="bg-[#F2D9A833] px-1 rounded">MONGODB_URI</code> in{" "}
        <code className="bg-[#F2D9A833] px-1 rounded">.env.local</code> has your real Atlas username, password, and
        cluster host — no <code className="bg-[#F2D9A833] px-1 rounded">&lt;placeholder&gt;</code> text — then restart{" "}
        <code className="bg-[#F2D9A833] px-1 rounded">npm run dev</code>.
        {error && <div className="mt-1 font-mono text-[11px] text-[#8A6A1A] opacity-80">{error}</div>}
      </div>
      <button onClick={() => setDismissed(true)} className="flex-shrink-0 opacity-60 hover:opacity-100">
        <X size={15} />
      </button>
    </div>
  );
}