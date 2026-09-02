
//need to add versioning in website so that it will be easy to store the old data in it

"use client";
import { useEffect, useState } from "react";
import { Bell, Mail, CheckCircle2, Send } from "lucide-react";
 
interface S { enabled: boolean; slackWebhookUrl: string; emailEnabled: boolean; alertEmail: string; emailOnSuccess: boolean; emailOnFailure: boolean; }
const DEF: S = { enabled: false, slackWebhookUrl: "", emailEnabled: false, alertEmail: "", emailOnSuccess: true, emailOnFailure: true };
 
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? "#2F6FED" : "#D1D5E0",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <span style={{
        position: "absolute",
        top: 4,
        left: value ? 24 : 4,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.2s",
        display: "block",
      }} />
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
 
  const cardStyle: React.CSSProperties = {
    background: "white",
    border: "1px solid #E3E7EF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  };
 
  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #F0F2F6",
    gap: 12,
  };
 
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6B7385",
    marginBottom: 6,
  };
 
  const inputStyle: React.CSSProperties = {
    border: "1px solid #E3E7EF",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
 
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 32, overflowY: "auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A2233", marginBottom: 4 }}>Alerts</h1>
      <p style={{ fontSize: 13, color: "#6B7385", marginBottom: 24 }}>Get notified when pipelines run or fail.</p>
 
      {/* EMAIL CARD */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2F6FED14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Mail size={15} color="#2F6FED" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Email notifications</div>
              <div style={{ fontSize: 11, color: "#9AA1B2" }}>Gmail, Outlook, Yahoo</div>
            </div>
          </div>
          <Toggle value={s.emailEnabled} onChange={v=>upd("emailEnabled",v)}/>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Alert email</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" value={s.alertEmail} onChange={e=>upd("alertEmail",e.target.value)}
                placeholder="you@gmail.com" style={{ ...inputStyle, flex: 1, width: "auto" }} />
              <button onClick={test} disabled={testing||!s.alertEmail}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, border: "1px solid #2F6FED", color: "#2F6FED", borderRadius: 8, padding: "8px 14px", background: "transparent", cursor: "pointer", whiteSpace: "nowrap", opacity: (testing||!s.alertEmail) ? 0.4 : 1 }}>
                <Send size={11}/> {testing?"Sending…":"Send test"}
              </button>
            </div>
            {result && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500, color: result.ok ? "#059669" : "#EF4444" }}>{result.msg}</div>}
          </div>
          <div style={{ borderTop: "1px solid #F4F6FA", paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9AA1B2", margin: 0 }}>Notify me when</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Scheduled run succeeds</div>
                <div style={{ fontSize: 11, color: "#9AA1B2" }}>Email on every successful scheduled run</div>
              </div>
              <Toggle value={s.emailOnSuccess} onChange={v=>upd("emailOnSuccess",v)}/>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Any run fails</div>
                <div style={{ fontSize: 11, color: "#9AA1B2" }}>Immediate alert on failure</div>
              </div>
              <Toggle value={s.emailOnFailure} onChange={v=>upd("emailOnFailure",v)}/>
            </div>
          </div>
        </div>
      </div>
 
      {/* SLACK CARD */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4A154B14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bell size={15} color="#4A154B" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Slack notifications</div>
              <div style={{ fontSize: 11, color: "#9AA1B2" }}>Failure alerts via webhook</div>
            </div>
          </div>
          <Toggle value={s.enabled} onChange={v=>upd("enabled",v)}/>
        </div>
        <div style={{ padding: 20 }}>
          <label style={labelStyle}>Webhook URL</label>
          <input type="url" value={s.slackWebhookUrl} onChange={e=>upd("slackWebhookUrl",e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
            style={{ ...inputStyle, fontFamily: "monospace" }} />
          <p style={{ fontSize: 11, color: "#9AA1B2", marginTop: 8 }}>Fires on failures only. Get URL from api.slack.com/apps → Incoming Webhooks.</p>
        </div>
      </div>
 
      {/* SAVE */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={save} disabled={saving}
          style={{ background: "#2F6FED", color: "white", fontSize: 14, fontWeight: 600, padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
          {saving?"Saving…":"Save settings"}
        </button>
        {saved && (
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669", fontSize: 14, fontWeight: 500 }}>
            <CheckCircle2 size={14}/> Saved
          </span>
        )}
      </div>
    </div>
  );
}
 