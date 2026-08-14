"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, X } from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/api-keys")
      .then((r) => r.json())
      .then((d) => { setKeys(d.keys || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function createKey() {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error); return; }
    setNewRawKey(data.rawKey);
    setNewName("");
    load();
  }

  async function deleteKey(id: string) {
    setDeletingId(id);
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-7 overflow-y-auto max-w-2xl">
      <div className="text-[12px] text-[#9AA1B2] mb-2">Home <span className="mx-1">›</span> <span className="text-[#6B7385]">API Keys</span></div>
      <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>API Keys</h1>
      <p className="text-[13.5px] text-[#6B7385] mb-6">
        Trigger any pipeline from your own code, a cron job, or a webhook — no browser session needed.
      </p>

      <div className="bg-white border border-[#E3E7EF] rounded-xl p-5 mb-5">
        <h3 className="text-[14px] font-semibold mb-3">Create a new key</h3>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-[#E3E7EF] rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Production webhook, Nightly cron"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
          />
          <button
            onClick={createKey}
            disabled={creating || !newName.trim()}
            className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={13} /> {creating ? "Creating…" : "Create"}
          </button>
        </div>
        {error && <p className="text-[12px] text-red-600 mt-2">{error}</p>}
      </div>

      {newRawKey && (
        <div className="bg-[#FFF7E8] border border-[#F2D9A8] rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={15} className="text-[#D98A1E] mt-0.5 flex-shrink-0" />
            <p className="text-[12.5px] text-[#7A5B12] font-medium">
              Copy this key now — it won't be shown again. We store a hash, never the plaintext.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E3E7EF] rounded-lg px-3 py-2">
            <code className="flex-1 text-[12px] font-mono text-[#1A2233] break-all">{newRawKey}</code>
            <button onClick={() => copyToClipboard(newRawKey)} className="flex-shrink-0 text-[#2F6FED] hover:text-[#245BD1]">
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>
          </div>
          <button onClick={() => setNewRawKey(null)} className="text-[11.5px] text-[#9AA1B2] mt-2 flex items-center gap-1 hover:text-[#6B7385]">
            <X size={12} /> I've copied it, dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-[#9AA1B2]">Loading…</div>
      ) : keys.length === 0 ? (
        <div className="text-sm text-[#9AA1B2] bg-white border border-[#E3E7EF] rounded-xl p-8 text-center">
          No API keys yet — create one above.
        </div>
      ) : (
        <div className="bg-white border border-[#E3E7EF] rounded-xl overflow-hidden mb-6">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#FAFBFD] text-[11px] uppercase tracking-wide text-[#6B7385]">
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Prefix</th>
                <th className="text-left px-4 py-2.5">Last used</th>
                <th className="text-left px-4 py-2.5">Created</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k._id} className="border-t border-[#F0F2F6]">
                  <td className="px-4 py-2.5 flex items-center gap-2">
                    <Key size={13} className="text-[#9AA1B2]" />
                    <span className="font-medium">{k.name}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#6B7385]">{k.keyPrefix}…</td>
                  <td className="px-4 py-2.5 text-[#9AA1B2] text-xs">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-2.5 text-[#9AA1B2] text-xs">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => deleteKey(k._id)}
                      disabled={deletingId === k._id}
                      className="text-[#9AA1B2] hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white border border-[#E3E7EF] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold mb-3">How to use</h3>
        <p className="text-[12.5px] text-[#6B7385] mb-3">
          Trigger any pipeline with a POST request. Get the pipeline ID from the URL when you open it in the Designer.
        </p>
        <div className="bg-[#0E0F1A] rounded-lg p-3 mb-3">
          <code className="text-[11.5px] text-[#5EEAD4] font-mono whitespace-pre-wrap leading-relaxed">{`curl -X POST https://your-domain.com/api/pipelines/PIPELINE_ID/trigger \\
  -H "Authorization: Bearer cgf_your_key_here" \\
  -H "Content-Type: application/json"`}</code>
        </div>
        <div className="bg-[#0E0F1A] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#5B6480] mb-2 font-mono">Response</p>
          <code className="text-[11.5px] text-[#A5B4FC] font-mono whitespace-pre-wrap leading-relaxed">{`{
  "status": "success",
  "pipelineName": "My pipeline",
  "rowsOut": 142,
  "durationMs": 380,
  "steps": [...]
}`}</code>
        </div>
      </div>
    </div>
  );
}