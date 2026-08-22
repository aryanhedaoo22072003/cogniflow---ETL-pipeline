"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, TEMPLATE_CATEGORIES, Template } from "@/lib/templates";
import { Sparkles, ArrowRight, Loader2, Search } from "lucide-react";

const DIFFICULTY_COLOR = {
  Beginner: "bg-emerald-50 text-emerald-700",
  Intermediate: "bg-blue-50 text-blue-700",
  Advanced: "bg-violet-50 text-violet-700",
};

const CATEGORY_COLOR: Record<string, string> = {
  "Data Quality": "#2F6FED",
  "HR & People": "#1FA971",
  "Finance": "#D98A1E",
  "Sales & CRM": "#7C6AE8",
  "E-Commerce": "#DA4B4B",
  "Analytics": "#5B9CF6",
};

export default function TemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchesCat = activeCategory === "All" || t.category === activeCategory;
    const matchesQuery =
      !query ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.useCases.some((uc) => uc.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  async function cloneTemplate(templateId: string) {
    setCloningId(templateId);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/dashboard/designer/${data.pipeline._id}`);
    } catch {
      setCloningId(null);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-7 pb-4 border-b border-[#E3E7EF] bg-white">
        <div className="text-[12px] text-[#9AA1B2] mb-2">
          Home <span className="mx-1">›</span> <span className="text-[#6B7385]">Templates</span>
        </div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>
              Template Gallery
            </h1>
            <p className="text-[13.5px] text-[#6B7385] max-w-lg">
              Start from a real-world pipeline — one click to clone it into your workspace, already configured and ready to attach your data to.
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AA1B2]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              className="pl-8 pr-3 py-2 text-xs border border-[#E3E7EF] rounded-lg w-52 bg-[#FAFBFD]"
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                activeCategory === cat
                  ? "bg-[#1A2233] text-white border-[#1A2233]"
                  : "bg-white text-[#6B7385] border-[#E3E7EF] hover:border-[#2F6FED] hover:text-[#2F6FED]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-7">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className="bg-white border border-[#E3E7EF] rounded-xl p-5 hover:border-[#2F6FED] hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: CATEGORY_COLOR[t.category] || "#6B7385" }}
                >
                  {t.category.slice(0, 2).toUpperCase()}
                </div>
                <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[t.difficulty]}`}>
                  {t.difficulty}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold mb-1.5 leading-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                {t.name}
              </h3>
              <p className="text-[12.5px] text-[#6B7385] leading-relaxed mb-3 line-clamp-2">{t.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {t.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10.5px] bg-[#F4F6FA] text-[#6B7385] px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F6]">
                <span className="text-[11.5px] font-mono text-[#9AA1B2]">{t.steps.length} steps</span>
                <button
                  onClick={(e) => { e.stopPropagation(); cloneTemplate(t.id); }}
                  disabled={!!cloningId}
                  className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50 hover:bg-[#245BD1] transition-colors"
                >
                  {cloningId === t.id
                    ? <><Loader2 size={12} className="animate-spin" /> Cloning…</>
                    : <>Use template <ArrowRight size={11} /></>}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-[#9AA1B2] text-sm">
              No templates match your search.
            </div>
          )}
        </div>
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-white rounded-2xl w-[540px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#E3E7EF]">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[12px] font-bold"
                  style={{ background: CATEGORY_COLOR[selectedTemplate.category] || "#6B7385" }}
                >
                  {selectedTemplate.category.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ fontFamily: "'Space Grotesk'" }}>{selectedTemplate.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#9AA1B2]">{selectedTemplate.category}</span>
                    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[selectedTemplate.difficulty]}`}>
                      {selectedTemplate.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[13.5px] text-[#6B7385] leading-relaxed">{selectedTemplate.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <h4 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] font-semibold mb-2">Use cases</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.useCases.map((uc) => (
                    <span key={uc} className="text-[12px] bg-[#EFF4FF] text-[#2F4E8C] px-2.5 py-1 rounded-lg">{uc}</span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] font-semibold mb-2">
                  Pipeline steps ({selectedTemplate.steps.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedTemplate.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-[#FAFBFD] rounded-lg px-3 py-2">
                      <span className="text-[10px] font-mono text-[#9AA1B2] w-4">{i + 1}</span>
                      <span className="w-2 h-2 rounded-sm bg-[#7C6AE8] flex-shrink-0" />
                      <span className="text-[13px] font-medium">{step.label}</span>
                      <span className="text-[10.5px] font-mono text-[#9AA1B2] ml-auto">{step.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-wide text-[#9AA1B2] font-semibold mb-2">Expected columns</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.sampleHeaders.map((h) => (
                    <span key={h} className="text-[11px] font-mono bg-[#F4F6FA] text-[#6B7385] px-2 py-0.5 rounded">{h}</span>
                  ))}
                </div>
                <p className="text-[11px] text-[#9AA1B2] mt-2">
                  Your CSV doesn't need to match exactly — column names can be remapped after cloning.
                </p>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-[#E3E7EF]">
              <button onClick={() => setSelectedTemplate(null)}
                className="text-xs font-semibold border border-[#E3E7EF] rounded-lg px-4 py-2.5 flex-1">
                Cancel
              </button>
              <button
                onClick={() => cloneTemplate(selectedTemplate.id)}
                disabled={!!cloningId}
                className="text-xs font-semibold bg-[#2F6FED] text-white rounded-lg px-4 py-2.5 flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cloningId
                  ? <><Loader2 size={13} className="animate-spin" /> Cloning…</>
                  : <><Sparkles size={13} /> Clone to my workspace</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}