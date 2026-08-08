import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0E0F1A] text-[#EAEBF5]">
      <nav className="flex items-center justify-between px-8 h-16 border-b border-[#2A2E4A]">
        <div className="flex items-center gap-2 font-bold text-[17px]" style={{ fontFamily: "'Space Grotesk'" }}>
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B7FFF] to-[#5B9CF6]" />
          CogniFlow
        </div>
        <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-semibold text-sm px-4 py-2 rounded-lg">
          Open dashboard
        </Link>
      </nav>

      <section className="max-w-3xl mx-auto text-center pt-28 px-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B7FFF] border border-[#8B7FFF33] bg-[#8B7FFF14] rounded-full px-3 py-1.5 mb-6">
          NO-CODE ETL, IN YOUR BROWSER
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "'Space Grotesk'" }}>
          Build ETL pipelines by <span className="text-[#8B7FFF]">dragging</span>, not scripting.
        </h1>
        <p className="text-lg text-[#8B8FB0] max-w-xl mx-auto mb-9">
          CogniFlow is a visual pipeline builder for people who need Informatica-grade transforms — filter, join,
          lookup, aggregate, SCD — without the enterprise price tag or the learning curve.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/dashboard/designer/new" className="bg-[#8B7FFF] text-[#12102A] font-semibold px-6 py-3 rounded-lg">
            Start building — it's free
          </Link>
          <Link href="/dashboard" className="border border-[#2A2E4A] px-6 py-3 rounded-lg font-medium">
            View dashboard
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto grid grid-cols-3 gap-5 px-6 mt-24 pb-24">
        {[
          ["Filter · Rename · Dedupe", "Everyday row and column cleanup, no SQL required."],
          ["Joiner · Lookup · Union", "Combine multiple CSVs the way you'd combine tables."],
          ["Aggregator · Rank · Sorter", "Group, rank, and order your data for reporting."],
          ["Update Strategy", "Compare against a snapshot and tag INSERT/UPDATE/DELETE — real SCD logic."],
          ["Router", "Split rows into named routes based on a condition."],
          ["Normalizer", "Unpivot repeating columns into clean rows."],
        ].map(([title, desc]) => (
          <div key={title} className="border border-[#2A2E4A] rounded-xl p-5 bg-[#161829]">
            <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
            <p className="text-xs text-[#8B8FB0] leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
