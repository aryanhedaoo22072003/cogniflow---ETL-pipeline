"use client";

import { useEffect, useState } from "react";
import { BellRing, Send, CheckCircle2, XCircle, Info } from "lucide-react";

export default function AlertsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/alerts/settings")
      .then((r) => r.json())
      .then((d) => {
        setWebhookUrl(d.settings?.slackWebhookUrl || "");
        setEnabled(!!d.settings?.enabled);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    setSaveMsg("");
    await fetch("/api/alerts/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slackWebhookUrl: webhookUrl, enabled }),
    });
    setSaving(false);
    setSaveMsg("Saved");
    setTimeout(() => setSaveMsg(""), 2000);
  }

  async function sendTest() {
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/alerts/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slackWebhookUrl: webhookUrl }),
    });
    const data = await res.json();
    setTestResult(data);
    setTesting(false);
  }

  if (loading) return <div className="p-8 text-sm text-[#6B7385]">Loading…</div>;

  return (
    <div className="p-7 overflow-y-auto max-w-2xl">
      <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Alerts</span></div>
      <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Alerts</h1>
      <p className="text-[13.5px] text-[#6B7385] mb-6">
        Get a Slack message the moment a pipeline run fails — whether it's a direct run, a step inside a Taskflow, or a Schedule firing unattended.
      </p>

      <div className="bg-white border border-[#E3E7EF] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#4A154B14] text-[#4A154B]">
            <BellRing size={17} />
          </div>
          <div>
            <h3 className="text-[14.5px] font-semibold">Slack notifications</h3>
            <p className="text-[11.5px] text-[#9AA1B2]">Uses a Slack Incoming Webhook — no OAuth app needed.</p>
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className={`ml-auto w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${enabled ? "bg-[#2F6FED]" : "bg-[#E3E7EF]"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>

        <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Webhook URL</label>
        <input
          className="w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm mb-1"
          placeholder="https://hooks.slack.com/services/T000/B000/xxxxxxxx"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="text-[11px] text-[#9AA1B2] mb-4">
          Create one at Slack → your workspace → Apps → "Incoming Webhooks" → Add to a channel.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={sendTest}
            disabled={testing || !webhookUrl}
            className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-3.5 py-2 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send size={12} /> {testing ? "Sending…" : "Send test alert"}
          </button>
          {saveMsg && <span className="text-[11.5px] text-emerald-600 font-semibold">{saveMsg}</span>}
        </div>

        {testResult && (
          <div className={`flex items-start gap-2 mt-3 text-[12.5px] px-3 py-2.5 rounded-lg ${testResult.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {testResult.ok ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="mt-0.5 flex-shrink-0" />}
            {testResult.ok ? "Test message sent — check your Slack channel." : testResult.error}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 bg-[#EFF4FF] border border-[#D6E4FF] rounded-lg px-4 py-3 text-[12.5px] text-[#2F4E8C]">
        <Info size={15} className="mt-0.5 flex-shrink-0" />
        <div>
          Alerts fire automatically for every failed run — direct runs, Taskflow steps, and Schedules alike — as long as this is enabled and saved.
          Nothing extra to configure per pipeline.
        </div>
      </div>
    </div>
  );
}