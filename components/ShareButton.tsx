"use client";
import { useState } from "react";
import { Share2, Copy, Check, X, Trash2 } from "lucide-react";

interface Props { pipelineId: string; }

export default function ShareButton({ pipelineId }: Props) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateLink() {
    setLoading(true);
    const res = await fetch(`/api/pipelines/${pipelineId}/share`, { method: "POST" });
    const data = await res.json();
    setShareUrl(data.shareUrl);
    setLoading(false);
  }

  async function revokeLink() {
    await fetch(`/api/pipelines/${pipelineId}/share`, { method: "DELETE" });
    setShareUrl(null);
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!pipelineId || pipelineId === "new") return null;

  return (
    <>
      <button
        onClick={() => { setOpen(true); if (!shareUrl) generateLink(); }}
        className="text-xs font-semibold border border-[#E3E7EF] text-[#6B7385] rounded-lg px-3 py-1.5 hover:border-[#2F6FED] hover:text-[#2F6FED] flex items-center gap-1.5 transition-colors"
      >
        <Share2 size={12} /> Share
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-[#2F6FED]" />
                <h2 className="text-[15px] font-bold">Share pipeline</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#9AA1B2] hover:text-[#1A2233]">
                <X size={18} />
              </button>
            </div>

            <p className="text-[12.5px] text-[#6B7385] mb-4 leading-relaxed">
              Anyone with this link can view the pipeline structure, steps, and column schema — but cannot edit or run it.
            </p>

            {loading ? (
              <div className="text-center py-4 text-sm text-[#9AA1B2]">Generating link…</div>
            ) : shareUrl ? (
              <>
                <div className="flex gap-2 mb-3">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 border border-[#E3E7EF] rounded-lg px-3 py-2 text-xs font-mono bg-[#FAFBFD] focus:outline-none"
                  />
                  <button onClick={copyLink}
                    className={`flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-3 py-2 transition-colors ${copied ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-[#2F6FED] text-[#2F6FED] hover:bg-[#2F6FED10]"}`}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11.5px] text-[#6B7385]">Link is active</span>
                  <button onClick={revokeLink} className="ml-auto flex items-center gap-1 text-[11px] text-red-500 hover:underline">
                    <Trash2 size={10} /> Revoke
                  </button>
                </div>
              </>
            ) : (
              <button onClick={generateLink}
                className="w-full bg-[#2F6FED] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#245BD1] flex items-center justify-center gap-2">
                <Share2 size={14} /> Generate share link
              </button>
            )}

            <div className="mt-4 bg-[#F4F6FA] rounded-lg p-3 text-[11px] text-[#6B7385]">
              ℹ️ The shared view shows pipeline structure only — no actual data or CSV rows are exposed.
            </div>
          </div>
        </div>
      )}
    </>
  );
}