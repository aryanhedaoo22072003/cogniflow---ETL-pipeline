// "use client";

// import { useEffect, useState } from "react";
// import { BellRing, Send, CheckCircle2, XCircle, Info } from "lucide-react";

// export default function AlertsPage() {
//   const [webhookUrl, setWebhookUrl] = useState("");
//   const [enabled, setEnabled] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [testing, setTesting] = useState(false);
//   const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
//   const [saveMsg, setSaveMsg] = useState("");

//   useEffect(() => {
//     fetch("/api/alerts/settings")
//       .then((r) => r.json())
//       .then((d) => {
//         setWebhookUrl(d.settings?.slackWebhookUrl || "");
//         setEnabled(!!d.settings?.enabled);
//         setLoading(false);
//       });
//   }, []);

//   async function save() {
//     setSaving(true);
//     setSaveMsg("");
//     await fetch("/api/alerts/settings", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ slackWebhookUrl: webhookUrl, enabled }),
//     });
//     setSaving(false);
//     setSaveMsg("Saved");
//     setTimeout(() => setSaveMsg(""), 2000);
//   }

//   async function sendTest() {
//     setTesting(true);
//     setTestResult(null);
//     const res = await fetch("/api/alerts/test", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ slackWebhookUrl: webhookUrl }),
//     });
//     const data = await res.json();
//     setTestResult(data);
//     setTesting(false);
//   }

//   if (loading) return <div className="p-8 text-sm text-[#6B7385]">Loading…</div>;

//   return (
//     <div className="p-7 overflow-y-auto max-w-2xl">
//       <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Alerts</span></div>
//       <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Alerts</h1>
//       <p className="text-[13.5px] text-[#6B7385] mb-6">
//         Get a Slack message the moment a pipeline run fails — whether it's a direct run, a step inside a Taskflow, or a Schedule firing unattended.
//       </p>

//       <div className="bg-white border border-[#E3E7EF] rounded-xl p-5 mb-4">
//         <div className="flex items-center gap-2.5 mb-4">
//           <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#4A154B14] text-[#4A154B]">
//             <BellRing size={17} />
//           </div>
//           <div>
//             <h3 className="text-[14.5px] font-semibold">Slack notifications</h3>
//             <p className="text-[11.5px] text-[#9AA1B2]">Uses a Slack Incoming Webhook — no OAuth app needed.</p>
//           </div>
//           <button
//             onClick={() => setEnabled((v) => !v)}
//             className={`ml-auto w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${enabled ? "bg-[#2F6FED]" : "bg-[#E3E7EF]"}`}
//           >
//             <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? "left-[18px]" : "left-0.5"}`} />
//           </button>
//         </div>

//         <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Webhook URL</label>
//         <input
//           className="w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm mb-1"
//           placeholder="https://hooks.slack.com/services/T000/B000/xxxxxxxx"
//           value={webhookUrl}
//           onChange={(e) => setWebhookUrl(e.target.value)}
//         />
//         <p className="text-[11px] text-[#9AA1B2] mb-4">
//           Create one at Slack → your workspace → Apps → "Incoming Webhooks" → Add to a channel.
//         </p>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={save}
//             disabled={saving}
//             className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 disabled:opacity-50"
//           >
//             {saving ? "Saving…" : "Save"}
//           </button>
//           <button
//             onClick={sendTest}
//             disabled={testing || !webhookUrl}
//             className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-3.5 py-2 flex items-center gap-1.5 disabled:opacity-50"
//           >
//             <Send size={12} /> {testing ? "Sending…" : "Send test alert"}
//           </button>
//           {saveMsg && <span className="text-[11.5px] text-emerald-600 font-semibold">{saveMsg}</span>}
//         </div>

//         {testResult && (
//           <div className={`flex items-start gap-2 mt-3 text-[12.5px] px-3 py-2.5 rounded-lg ${testResult.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
//             {testResult.ok ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="mt-0.5 flex-shrink-0" />}
//             {testResult.ok ? "Test message sent — check your Slack channel." : testResult.error}
//           </div>
//         )}
//       </div>

//       <div className="flex items-start gap-2.5 bg-[#EFF4FF] border border-[#D6E4FF] rounded-lg px-4 py-3 text-[12.5px] text-[#2F4E8C]">
//         <Info size={15} className="mt-0.5 flex-shrink-0" />
//         <div>
//           Alerts fire automatically for every failed run — direct runs, Taskflow steps, and Schedules alike — as long as this is enabled and saved.
//           Nothing extra to configure per pipeline.
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import { Bell, Mail, CheckCircle2, Send } from "lucide-react";

export default function AlertsPage() {
  const [settings, setSettings] = useState<any>({ enabled: false, slackWebhookUrl: "", emailEnabled: false, alertEmail: "", emailOnSuccess: true, emailOnFailure: true });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/alerts").then(r => r.json()).then(d => { if (d.settings && Object.keys(d.settings).length) setSettings((p: any) => ({ ...p, ...d.settings })); });
  }, []);

  async function save() {
    setSaving(true); setSaved(false);
    await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function sendTestEmail() {
    if (!settings.alertEmail) { setTestResult({ ok: false, message: "Enter an email address first" }); return; }
    setTesting(true); setTestResult(null);
    const res = await fetch("/api/alerts/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: settings.alertEmail }) });
    const data = await res.json();
    setTestResult({ ok: data.ok, message: data.ok ? "Test email sent! Check your inbox." : `Failed: ${data.error}` });
    setTesting(false);
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#2F6FED]" : "bg-[#E3E7EF]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2233] mb-1">Alerts</h1>
        <p className="text-[13px] text-[#6B7385]">Get notified when scheduled pipelines and taskflows run or fail.</p>
      </div>

      {/* EMAIL */}
      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2F6FED14] flex items-center justify-center"><Mail size={16} className="text-[#2F6FED]" /></div>
            <div>
              <div className="text-[14px] font-semibold">Email notifications</div>
              <div className="text-[11.5px] text-[#9AA1B2]">Gmail, Outlook, Yahoo — any email provider</div>
            </div>
          </div>
          <Toggle value={settings.emailEnabled} onChange={v => setSettings((s: any) => ({ ...s, emailEnabled: v }))} />
        </div>
        <div className={`p-5 space-y-4 transition-opacity ${settings.emailEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5">Alert email address</label>
            <div className="flex gap-2">
              <input type="email" className="flex-1 border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F6FED]"
                placeholder="you@gmail.com or you@outlook.com" value={settings.alertEmail}
                onChange={e => setSettings((s: any) => ({ ...s, alertEmail: e.target.value }))} />
              <button onClick={sendTestEmail} disabled={testing || !settings.alertEmail}
                className="flex items-center gap-1.5 text-xs font-semibold border border-[#2F6FED] text-[#2F6FED] rounded-lg px-3 py-2 hover:bg-[#2F6FED10] disabled:opacity-40">
                <Send size={12} /> {testing ? "Sending…" : "Test"}
              </button>
            </div>
            {testResult && <div className={`mt-2 text-[11.5px] font-medium ${testResult.ok ? "text-emerald-600" : "text-red-500"}`}>{testResult.ok ? "✓" : "✗"} {testResult.message}</div>}
          </div>
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7385]">Send email when</div>
            {[
              { key: "emailOnSuccess", label: "Scheduled run succeeds", sub: "Every successful scheduled pipeline or taskflow run" },
              { key: "emailOnFailure", label: "Any run fails", sub: "Immediate alert on failure — always recommended" },
            ].map(opt => (
              <label key={opt.key} className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <div className="text-[13px] font-medium">{opt.label}</div>
                  <div className="text-[11.5px] text-[#9AA1B2]">{opt.sub}</div>
                </div>
                <Toggle value={settings[opt.key]} onChange={v => setSettings((s: any) => ({ ...s, [opt.key]: v }))} />
              </label>
            ))}
          </div>
          <div className="bg-[#F4F6FA] rounded-lg p-4">
            <div className="text-[11.5px] font-semibold text-[#1A2233] mb-2">⚙️ Add to <code className="font-mono bg-white px-1 rounded">.env.local</code></div>
            <div className="space-y-1 font-mono text-[11px] text-[#6B7385]">
              {[["SMTP_HOST","smtp.gmail.com  # or smtp-mail.outlook.com"],["SMTP_PORT","587"],["SMTP_USER","you@gmail.com"],["SMTP_PASS","your-app-password"],["SMTP_FROM","you@gmail.com"]].map(([k,v]) => (
                <div key={k} className="flex gap-2"><span className="text-[#2F6FED] min-w-[140px]">{k}</span><span>= {v}</span></div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-[#9AA1B2] space-y-1">
              <div><strong>Gmail:</strong> Google Account → Security → 2-Step Verification → App passwords</div>
              <div><strong>Outlook:</strong> Use <code className="font-mono">smtp-mail.outlook.com</code> port 587</div>
            </div>
          </div>
        </div>
      </div>

      {/* SLACK */}
      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#4A154B14] flex items-center justify-center"><Bell size={16} className="text-[#4A154B]" /></div>
            <div>
              <div className="text-[14px] font-semibold">Slack notifications</div>
              <div className="text-[11.5px] text-[#9AA1B2]">Failure alerts via Slack webhook</div>
            </div>
          </div>
          <Toggle value={settings.enabled} onChange={v => setSettings((s: any) => ({ ...s, enabled: v }))} />
        </div>
        <div className={`p-5 transition-opacity ${settings.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5">Webhook URL</label>
          <input type="url" className="w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2F6FED]"
            placeholder="https://hooks.slack.com/services/…" value={settings.slackWebhookUrl}
            onChange={e => setSettings((s: any) => ({ ...s, slackWebhookUrl: e.target.value }))} />
          <p className="text-[11.5px] text-[#9AA1B2] mt-2">Create at api.slack.com/apps → Incoming Webhooks. Fires on failures only.</p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-6 p-5">
        <div className="text-[13px] font-semibold mb-3">When do alerts fire?</div>
        <div className="space-y-3">
          {[
            { icon: "📅", title: "Scheduled pipeline runs", desc: "Success or failure email after every scheduled run" },
            { icon: "🔗", title: "Scheduled taskflow runs", desc: "One summary email listing all pipeline results in the taskflow" },
            { icon: "✗", title: "Any failure", desc: "Immediate email whenever any pipeline or taskflow fails" },
          ].map(item => (
            <div key={item.title} className="flex gap-3">
              <span className="text-lg">{item.icon}</span>
              <div><div className="text-[12.5px] font-semibold">{item.title}</div><div className="text-[11.5px] text-[#9AA1B2]">{item.desc}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="bg-[#2F6FED] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#245BD1] disabled:opacity-50">
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle2 size={15} /> Saved</div>}
      </div>
    </div>
  );
}