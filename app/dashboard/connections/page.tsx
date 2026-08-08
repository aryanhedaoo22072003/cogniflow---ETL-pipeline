"use client";

import { useEffect, useState } from "react";
import { Database, Sheet, Globe, FileSpreadsheet, Cloud, X } from "lucide-react";

const TYPES = [
  { type: "postgres", label: "PostgreSQL", icon: Database, color: "#2F6FED", fields: [
    { key: "connectionString", label: "Connection string", placeholder: "postgresql://user:pass@host:5432/dbname" },
    { key: "query", label: "Query", placeholder: "SELECT * FROM customers" },
  ]},
  { type: "mysql", label: "MySQL", icon: Database, color: "#D98A1E", fields: [
    { key: "connectionString", label: "Connection string", placeholder: "mysql://user:pass@host:3306/dbname" },
    { key: "query", label: "Query", placeholder: "SELECT * FROM orders" },
  ]},
  { type: "googlesheet", label: "Google Sheets", icon: Sheet, color: "#1FA971", fields: [
    { key: "csvUrl", label: "Published CSV URL", placeholder: "File → Share → Publish to web → CSV" },
  ]},
  { type: "restapi", label: "REST API", icon: Globe, color: "#7C6AE8", fields: [
    { key: "url", label: "Endpoint URL", placeholder: "https://api.example.com/data" },
    { key: "jsonPath", label: "Path to array (optional)", placeholder: "e.g. data.items" },
  ]},
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [modalType, setModalType] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ name: "" });
  const [saving, setSaving] = useState(false);
  const [testMsg, setTestMsg] = useState("");

  function load() {
    fetch("/api/connections").then((r) => r.json()).then((d) => setConnections(d.connections || []));
  }
  useEffect(() => { load(); }, []);

  function openModal(type: string) {
    setModalType(type);
    setForm({ name: "" });
    setTestMsg("");
  }

  async function saveConnection() {
    setSaving(true);
    setTestMsg("");
    const typeDef = TYPES.find((t) => t.type === modalType)!;
    const config: Record<string, string> = {};
    typeDef.fields.forEach((f) => (config[f.key] = form[f.key] || ""));
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name || typeDef.label, type: modalType, config }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.testResult?.ok) {
      setTestMsg("✓ Connected — " + data.testResult.rows.length + " sample rows returned");
      setTimeout(() => { setModalType(null); load(); }, 900);
    } else {
      setTestMsg("✕ " + (data.testResult?.error || data.error || "Connection failed"));
    }
  }

  async function deleteConnection(id: string) {
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    load();
  }

  const typeDef = TYPES.find((t) => t.type === modalType);

  return (
    <div className="p-7 overflow-y-auto">
      <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Connections</span></div>
      <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Connections</h1>
      <p className="text-[13.5px] text-[#6B7385] mb-6">Set up real sources once, then reuse them in any pipeline's Source node.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.type} onClick={() => openModal(t.type)} className="bg-white border border-[#E3E7EF] rounded-xl p-5 text-left hover:border-[#2F6FED] hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: t.color + "18", color: t.color }}>
                <Icon size={17} />
              </div>
              <h4 className="text-[14.5px] font-semibold">{t.label}</h4>
              <div className="text-xs mt-1.5 text-[#2F6FED] font-semibold">+ Add connection</div>
            </button>
          );
        })}
        <div className="bg-white border border-[#E3E7EF] rounded-xl p-5 opacity-55">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-[#7C6AE818] text-[#7C6AE8]"><Cloud size={17} /></div>
          <h4 className="text-[14.5px] font-semibold">Salesforce</h4>
          <div className="text-xs mt-1.5 text-[#9AA1B2]">Coming soon — needs an OAuth connected app</div>
        </div>
      </div>

      <h3 className="text-[15px] font-semibold mb-3">Your connections</h3>
      {connections.length === 0 ? (
        <div className="text-sm text-[#9AA1B2] bg-white border border-[#E3E7EF] rounded-xl p-8 text-center">No connections yet — add one above.</div>
      ) : (
        <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#FAFBFD] text-[11.5px] uppercase tracking-wide text-[#6B7385]">
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Last tested</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {connections.map((c) => (
                <tr key={c._id} className="border-t border-[#F0F2F6]">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 text-[#6B7385]">{c.type}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${c.lastStatus === "ok" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {c.lastStatus === "ok" ? "Active" : "Error"}
                    </span>
                    {c.lastStatus === "error" && <div className="text-[10.5px] text-red-400 mt-1 max-w-xs truncate">{c.lastError}</div>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#9AA1B2] text-xs">{c.lastTestedAt ? new Date(c.lastTestedAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => deleteConnection(c._id)} className="text-xs text-[#9AA1B2] hover:text-red-500">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalType && typeDef && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[16px] font-semibold">Add {typeDef.label} connection</h3>
              <button onClick={() => setModalType(null)}><X size={16} className="text-[#9AA1B2]" /></button>
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-mono text-[#6B7385] mb-1">Connection name</label>
              <input className="w-full border border-[#E3E7EF] rounded px-2.5 py-2 text-sm" placeholder={typeDef.label} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {typeDef.fields.map((f) => (
              <div className="mb-3" key={f.key}>
                <label className="block text-[11px] font-mono text-[#6B7385] mb-1">{f.label}</label>
                <input className="w-full border border-[#E3E7EF] rounded px-2.5 py-2 text-sm" placeholder={f.placeholder} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            {testMsg && <div className={`text-xs mb-3 ${testMsg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{testMsg}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalType(null)} className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-3.5 py-2">Cancel</button>
              <button onClick={saveConnection} disabled={saving} className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3.5 py-2 disabled:opacity-50">
                {saving ? "Testing…" : "Save & test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}