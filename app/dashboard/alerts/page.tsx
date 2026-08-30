"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, CheckCircle2, Send } from "lucide-react";

interface AlertSettings {
  enabled: boolean;
  slackWebhookUrl: string;
  emailEnabled: boolean;
  alertEmail: string;
  emailOnSuccess: boolean;
  emailOnFailure: boolean;
}

const DEFAULT: AlertSettings = {
  enabled: false,
  slackWebhookUrl: "",
  emailEnabled: false,
  alertEmail: "",
  emailOnSuccess: true,
  emailOnFailure: true,
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none ${value ? "bg-[#2F6FED]" : "bg-[#D1D5E0]"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function AlertsPage() {
  const [settings, setSettings] = useState<AlertSettings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/alerts")
      .then(r => r.json())
      .then(d => {
        if (d.settings && Object.keys(d.settings).length > 0) {
          setSettings(s => ({ ...s, ...d.settings }));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function set<K extends keyof AlertSettings>(key: K, value: AlertSettings[K]) {
    setSettings(s => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true); setSaved(false);
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function sendTestEmail() {
    if (!settings.alertEmail) {
      setTestResult({ ok: false, message: "Enter an email address first" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/alerts/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: settings.alertEmail }),
      });
      const data = await res.json();
      setTestResult({
        ok: data.ok,
        message: data.ok
          ? "✓ Test email sent! Check your inbox (and spam folder)."
          : `✗ Failed: ${data.error || "Unknown error"}`,
      });
    } catch (err: any) {
      setTestResult({ ok: false, message: `✗ Network error: ${err.message}` });
    }
    setTesting(false);
  }

  if (!loaded) {
    return <div className="max-w-2xl mx-auto p-8 text-sm text-[#9AA1B2]">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2233] mb-1">Alerts</h1>
        <p className="text-[13px] text-[#6B7385]">
          Get notified when scheduled pipelines and taskflows run or fail.
        </p>
      </div>

      {/* ── EMAIL ── */}
      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2F6FED14] flex items-center justify-center">
              <Mail size={16} className="text-[#2F6FED]" />
            </div>
            <div>
              <div className="text-[14px] font-semibold">Email notifications</div>
              <div className="text-[11.5px] text-[#9AA1B2]">Gmail, Outlook, Yahoo — any email provider</div>
            </div>
          </div>
          <Toggle value={settings.emailEnabled} onChange={v => set("emailEnabled", v)} />
        </div>

        <div className={`p-5 space-y-4 ${settings.emailEnabled ? "" : "opacity-40 pointer-events-none select-none"}`}>
          {/* Email address + test */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5">
              Alert email address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F6FED]"
                placeholder="you@gmail.com"
                value={settings.alertEmail}
                onChange={e => set("alertEmail", e.target.value)}
              />
              <button
                type="button"
                onClick={sendTestEmail}
                disabled={testing || !settings.alertEmail}
                className="flex items-center gap-1.5 text-xs font-semibold border border-[#2F6FED] text-[#2F6FED] rounded-lg px-3 py-2 hover:bg-[#2F6FED10] disabled:opacity-40 whitespace-nowrap"
              >
                <Send size={12} />
                {testing ? "Sending…" : "Send test"}
              </button>
            </div>
            {testResult && (
              <div className={`mt-2 text-[12px] font-medium ${testResult.ok ? "text-emerald-600" : "text-red-500"}`}>
                {testResult.message}
              </div>
            )}
          </div>

          {/* When to send */}
          <div className="space-y-3 pt-1 border-t border-[#F4F6FA]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] pt-2">Send email when</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">Scheduled run succeeds</div>
                <div className="text-[11.5px] text-[#9AA1B2]">Email after every successful scheduled run</div>
              </div>
              <Toggle value={settings.emailOnSuccess} onChange={v => set("emailOnSuccess", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">Any run fails</div>
                <div className="text-[11.5px] text-[#9AA1B2]">Immediate alert on failure — always recommended</div>
              </div>
              <Toggle value={settings.emailOnFailure} onChange={v => set("emailOnFailure", v)} />
            </div>
          </div>

          {/* SMTP setup guide */}
          <div className="bg-[#F4F6FA] rounded-lg p-4 border border-[#E3E7EF]">
            <div className="text-[12px] font-semibold text-[#1A2233] mb-2">
              ⚙️ Required in <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#E3E7EF]">.env.local</code>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              {[
                ["SMTP_HOST", "smtp.gmail.com", "# Outlook: smtp-mail.outlook.com"],
                ["SMTP_PORT", "587", ""],
                ["SMTP_USER", "you@gmail.com", ""],
                ["SMTP_PASS", "xxxx xxxx xxxx xxxx", "# Gmail App Password (16 chars)"],
                ["SMTP_FROM", "you@gmail.com", ""],
              ].map(([k, v, comment]) => (
                <div key={k} className="flex gap-2 flex-wrap">
                  <span className="text-[#2F6FED] min-w-[120px]">{k}</span>
                  <span className="text-[#1A2233]">= {v}</span>
                  {comment && <span className="text-[#9AA1B2]">{comment}</span>}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 text-[11.5px] text-[#6B7385]">
              <div>
                <strong className="text-[#1A2233]">Gmail App Password:</strong>{" "}
                myaccount.google.com → Security → 2-Step Verification → App passwords → Create
              </div>
              <div>
                <strong className="text-[#1A2233]">Outlook:</strong>{" "}
                Use <code className="font-mono">smtp-mail.outlook.com</code> with your regular Outlook password
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SLACK ── */}
      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#4A154B14] flex items-center justify-center">
              <Bell size={16} className="text-[#4A154B]" />
            </div>
            <div>
              <div className="text-[14px] font-semibold">Slack notifications</div>
              <div className="text-[11.5px] text-[#9AA1B2]">Failure alerts via Slack webhook</div>
            </div>
          </div>
          <Toggle value={settings.enabled} onChange={v => set("enabled", v)} />
        </div>

        <div className={`p-5 ${settings.enabled ? "" : "opacity-40 pointer-events-none select-none"}`}>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5">
            Webhook URL
          </label>
          <input
            type="url"
            className="w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2F6FED]"
            placeholder="https://hooks.slack.com/services/T.../B.../..."
            value={settings.slackWebhookUrl}
            onChange={e => set("slackWebhookUrl", e.target.value)}
          />
          <p className="text-[11.5px] text-[#9AA1B2] mt-2">
            Fires on pipeline failures only. Create at{" "}
            <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className="text-[#2F6FED] hover:underline">
              api.slack.com/apps
            </a>{" "}
            → Incoming Webhooks.
          </p>
        </div>
      </div>

      {/* ── WHEN ALERTS FIRE ── */}
      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-6 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={14} className="text-[#D98A1E]" />
          <span className="text-[13px] font-semibold">When alerts fire</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: "📅", title: "Scheduled pipeline runs", desc: "Success or failure email after every scheduled run" },
            { icon: "🔗", title: "Scheduled taskflow runs", desc: "One summary email listing all pipeline results" },
            { icon: "✗", title: "Any failure", desc: "Immediate email whenever any pipeline fails, regardless of schedule" },
          ].map(item => (
            <div key={item.title} className="flex gap-3 items-start">
              <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <div className="text-[12.5px] font-semibold">{item.title}</div>
                <div className="text-[11.5px] text-[#9AA1B2]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SAVE ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-[#2F6FED] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#245BD1] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCircle2 size={15} /> Settings saved
          </div>
        )}
      </div>
    </div>
  );
}