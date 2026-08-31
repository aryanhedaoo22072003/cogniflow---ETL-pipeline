"use client";
import { useEffect, useState } from "react";
import { Bell, Mail, CheckCircle2, Send } from "lucide-react";

interface S { enabled: boolean; slackWebhookUrl: string; emailEnabled: boolean; alertEmail: string; emailOnSuccess: boolean; emailOnFailure: boolean; }
const DEF: S = { enabled: false, slackWebhookUrl: "", emailEnabled: false, alertEmail: "", emailOnSuccess: true, emailOnFailure: true };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#2F6FED]" : "bg-[#D1D5E0]"}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function AlertsPage() {
  const [s, setS] = useState<S>(DEF);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ok:boolean;msg:string}|null>(null);

  useEffect(() => {
    fetch("/api/alerts").then(r=>r.json()).then(d=>{
      if(d.settings && Object.keys(d.settings).length>0) setS(p=>({...p,...d.settings}));
      setLoaded(true);
    }).catch(()=>setLoaded(true));
  },[]);

  function upd<K extends keyof S>(k:K,v:S[K]){ setS(p=>({...p,[k]:v})); }

  async function save(){
    setSaving(true); setSaved(false);
    const r = await fetch("/api/alerts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});
    setSaving(false);
    if(r.ok){ setSaved(true); setTimeout(()=>setSaved(false),3000); }
  }

  async function test(){
    if(!s.alertEmail){ setResult({ok:false,msg:"Enter email first"}); return; }
    setTesting(true); setResult(null);
    try {
      const r = await fetch("/api/alerts/test-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s.alertEmail})});
      const d = await r.json();
      setResult({ok:d.ok,msg:d.ok?"✓ Test email sent! Check inbox.":"✗ Failed: "+(d.error||"Unknown")});
    } catch(e:any){ setResult({ok:false,msg:"✗ "+e.message}); }
    setTesting(false);
  }

  if(!loaded) return <div className="p-8 text-sm text-[#9AA1B2]">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 pb-16 overflow-y-auto min-h-0">
      <h1 className="text-2xl font-bold text-[#1A2233] mb-1">Alerts</h1>
      <p className="text-[13px] text-[#6B7385] mb-6">Get notified when pipelines run or fail.</p>

      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2F6FED14] flex items-center justify-center"><Mail size={15} className="text-[#2F6FED]"/></div>
            <div>
              <div className="font-semibold text-sm">Email notifications</div>
              <div className="text-[11px] text-[#9AA1B2]">Gmail, Outlook, Yahoo</div>
            </div>
          </div>
          <Toggle value={s.emailEnabled} onChange={v=>upd("emailEnabled",v)}/>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5">Alert email</label>
            <div className="flex gap-2">
              <input type="email" value={s.alertEmail} onChange={e=>upd("alertEmail",e.target.value)}
                placeholder="you@gmail.com"
                className="flex-1 border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F6FED]"/>
              <button onClick={test} disabled={testing||!s.alertEmail}
                className="flex items-center gap-1.5 text-xs font-semibold border border-[#2F6FED] text-[#2F6FED] rounded-lg px-3 py-2 hover:bg-[#2F6FED10] disabled:opacity-40 whitespace-nowrap">
                <Send size={11}/> {testing?"Sending…":"Send test"}
              </button>
            </div>
            {result && <div className={`mt-2 text-xs font-medium ${result.ok?"text-emerald-600":"text-red-500"}`}>{result.msg}</div>}
          </div>
          <div className="border-t border-[#F4F6FA] pt-3 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA1B2]">Notify me when</p>
            <div className="flex items-center justify-between">
              <div><div className="text-sm font-medium">Scheduled run succeeds</div><div className="text-[11px] text-[#9AA1B2]">Email on every successful scheduled run</div></div>
              <Toggle value={s.emailOnSuccess} onChange={v=>upd("emailOnSuccess",v)}/>
            </div>
            <div className="flex items-center justify-between">
              <div><div className="text-sm font-medium">Any run fails</div><div className="text-[11px] text-[#9AA1B2]">Immediate alert on failure</div></div>
              <Toggle value={s.emailOnFailure} onChange={v=>upd("emailOnFailure",v)}/>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E3E7EF] rounded-xl mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A154B14] flex items-center justify-center"><Bell size={15} className="text-[#4A154B]"/></div>
            <div>
              <div className="font-semibold text-sm">Slack notifications</div>
              <div className="text-[11px] text-[#9AA1B2]">Failure alerts via webhook</div>
            </div>
          </div>
          <Toggle value={s.enabled} onChange={v=>upd("enabled",v)}/>
        </div>
        <div className="p-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7385] mb-1.5">Webhook URL</label>
          <input type="url" value={s.slackWebhookUrl} onChange={e=>upd("slackWebhookUrl",e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
            className="w-full border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2F6FED]"/>
          <p className="text-[11px] text-[#9AA1B2] mt-2">Fires on failures only. Get URL from api.slack.com/apps → Incoming Webhooks.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="bg-[#2F6FED] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#245BD1] disabled:opacity-50">
          {saving?"Saving…":"Save settings"}
        </button>
        {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle2 size={14}/> Saved</span>}
      </div>
    </div>
  );
}
