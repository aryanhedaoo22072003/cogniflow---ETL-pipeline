import { connectDB } from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import { notFound } from "next/navigation";
import { Workflow, Database, ArrowRight } from "lucide-react";

const TRANSFORM_LABELS: Record<string, string> = {
  source: "Source", filter: "Filter", rename: "Rename Column",
  dedupe: "Deduplicate", nulls: "Handle Nulls", expression: "Expression",
  sequence: "Sequence Generator", sorter: "Sorter", rank: "Rank",
  aggregator: "Aggregator", router: "Router", union: "Union",
  joiner: "Joiner", lookup: "Lookup", updateStrategy: "Update Strategy",
  normalizer: "Normalizer", target: "Target",
  scd1: "SCD Type 1", scd2: "SCD Type 2", scd3: "SCD Type 3",
};

function NodeTypeColor(type: string) {
  if (type === "source") return "bg-blue-50 border-blue-200 text-blue-700";
  if (type === "target") return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (["scd1","scd2","scd3"].includes(type)) return "bg-purple-50 border-purple-200 text-purple-700";
  if (["router","union","joiner","lookup"].includes(type)) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-violet-50 border-violet-200 text-violet-700";
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectDB();
  const pipeline = await Pipeline.findOne({ shareToken: token, shareEnabled: true })
    .select("-nodes.config.rows -nodes.config.sampleRows -nodes.config.referenceRows")
    .lean<any>();

  if (!pipeline) notFound();

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E7EF]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B1220] flex items-center justify-center">
              <Workflow size={16} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-[15px]">CogniFlow</div>
              <div className="text-[11px] text-[#9AA1B2]">Shared pipeline view</div>
            </div>
          </div>
          <span className={`text-[11px] font-mono px-2 py-1 rounded font-semibold
            ${pipeline.environment === "PROD" ? "bg-emerald-50 text-emerald-600" :
              pipeline.environment === "SIT" ? "bg-amber-50 text-amber-600" :
              "bg-[#2F6FED14] text-[#2F6FED]"}`}>
            {pipeline.environment}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Pipeline info */}
        <div className="bg-white border border-[#E3E7EF] rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#1A2233] mb-1">{pipeline.name}</h1>
          <div className="text-[12.5px] text-[#9AA1B2]">
            {pipeline.nodes.length} steps · Last updated {new Date(pipeline.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Pipeline flow */}
        <div className="bg-white border border-[#E3E7EF] rounded-2xl p-6 mb-6">
          <h2 className="text-[14px] font-semibold mb-4">Pipeline flow</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {pipeline.nodes.map((node: any, i: number) => (
              <div key={node.id} className="flex items-center gap-2">
                <div className={`border rounded-xl px-3 py-2 text-[12px] font-semibold ${NodeTypeColor(node.type)}`}>
                  <div>{node.label}</div>
                  <div className="font-mono font-normal text-[10px] opacity-70">{node.type}</div>
                </div>
                {i < pipeline.nodes.length - 1 && <ArrowRight size={14} className="text-[#C5CADE] flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step details */}
        <div className="bg-white border border-[#E3E7EF] rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#F0F2F6]">
            <h2 className="text-[14px] font-semibold">Step details</h2>
          </div>
          <div className="divide-y divide-[#F4F6FA]">
            {pipeline.nodes.map((node: any, i: number) => (
              <div key={node.id} className="px-6 py-4 flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${NodeTypeColor(node.type)}`}>
                  {i + 1}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold">{node.label}</div>
                  <div className="text-[11.5px] font-mono text-[#9AA1B2]">{node.type}</div>
                  {node.type === "source" && node.config?.fileName && (
                    <div className="text-[11.5px] text-[#6B7385] mt-1">📄 {node.config.fileName}</div>
                  )}
                  {node.type === "source" && node.config?.connectionName && (
                    <div className="text-[11.5px] text-[#6B7385] mt-1">🔌 {node.config.connectionName}</div>
                  )}
                  {node.type === "filter" && node.config?.column && (
                    <div className="text-[11.5px] text-[#6B7385] mt-1">Filter: <code className="font-mono bg-[#F4F6FA] px-1 rounded">{node.config.column} {node.config.op} {node.config.value}</code></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columns */}
        {pipeline.headers?.length > 0 && (
          <div className="bg-white border border-[#E3E7EF] rounded-2xl p-6">
            <h2 className="text-[14px] font-semibold mb-3">Output columns</h2>
            <div className="flex flex-wrap gap-2">
              {pipeline.headers.map((h: string) => (
                <span key={h} className="text-[11.5px] font-mono bg-[#F4F6FA] border border-[#E3E7EF] text-[#6B7385] px-2.5 py-1 rounded-lg">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-[11.5px] text-[#9AA1B2]">
          This is a read-only shared view · Powered by <span className="font-semibold">CogniFlow</span>
        </div>
      </div>
    </div>
  );
}