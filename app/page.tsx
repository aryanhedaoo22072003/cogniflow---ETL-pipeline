import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-[#0E0F1A] text-[#EAEBF5] overflow-x-hidden">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-[#2A2E4A] sticky top-0 bg-[#0E0F1A]/90 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold text-[17px]" style={{ fontFamily: "'Space Grotesk'" }}>
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B7FFF] to-[#5B9CF6]" />
          CogniFlow
        </div>
        <div className="hidden md:flex items-center gap-6 text-[13.5px] text-[#8B8FB0]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#transforms" className="hover:text-white transition-colors">Transforms</a>
          <a href="#usecases" className="hover:text-white transition-colors">Use cases</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-semibold text-sm px-4 py-2 rounded-lg">
                Open dashboard
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            </>
          ) : (
            <>
              <SignInButton mode="modal" appearance={clerkAppearance}>
                <button className="text-[#C4CBDC] font-semibold text-sm px-4 py-2 rounded-lg hover:text-white">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal" appearance={clerkAppearance}>
                <button className="bg-[#8B7FFF] text-[#12102A] font-semibold text-sm px-4 py-2 rounded-lg">Get started free</button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-5xl mx-auto text-center pt-24 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#8B7FFF] opacity-[0.07] blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B7FFF] border border-[#8B7FFF33] bg-[#8B7FFF14] rounded-full px-3 py-1.5 mb-6">
          ✦ NO-CODE ETL PLATFORM FOR DATA TEAMS
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
          Enterprise ETL transforms.<br />
          <span className="bg-gradient-to-r from-[#8B7FFF] to-[#5B9CF6] bg-clip-text text-transparent">
            No code. No scripts. No BS.
          </span>
        </h1>
        <p className="text-lg text-[#8B8FB0] max-w-2xl mx-auto mb-4 leading-relaxed">
          CogniFlow gives you the power of Informatica IICS — Filter, Joiner, Lookup, Aggregator, SCD Update Strategy —
          in a drag-and-drop canvas your whole team can use. Build in minutes. Run on demand or on a schedule.
          Trigger from your own code via API.
        </p>
        <p className="text-sm text-[#5B6480] mb-10">No credit card required · Free tier available · Teams supported</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-16">
          {userId ? (
            <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-3.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity">
              Go to your dashboard →
            </Link>
          ) : (
            <>
              <SignUpButton mode="modal" appearance={clerkAppearance}>
                <button className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-3.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity">
                  Start building free →
                </button>
              </SignUpButton>
              <Link href="/dashboard/templates" className="border border-[#2A2E4A] px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:border-[#8B7FFF] transition-colors">
                Browse templates
              </Link>
            </>
          )}
        </div>

        {/* pipeline preview mockup */}
        <div className="relative bg-[#161829] border border-[#2A2E4A] rounded-2xl p-6 text-left shadow-2xl shadow-black/40 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="text-[11px] font-mono text-[#5B6480] ml-2">CogniFlow Designer — Customer Data Cleanup</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: "Source", color: "#5B9CF6", sub: "customers.csv" },
              { label: "Handle Nulls", color: "#8B7FFF", sub: "drop empty emails" },
              { label: "Deduplicate", color: "#8B7FFF", sub: "by email" },
              { label: "Filter", color: "#8B7FFF", sub: "status = active" },
              { label: "Aggregator", color: "#8B7FFF", sub: "sum order_value" },
              { label: "Target", color: "#1FA971", sub: "customers_clean" },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-[#0E0F1A] border border-[#2A2E4A] rounded-xl px-4 py-3 min-w-[130px]" style={{ borderTopColor: node.color, borderTopWidth: 2 }}>
                  <div className="text-[12.5px] font-semibold text-white">{node.label}</div>
                  <div className="text-[10.5px] text-[#5B6480] mt-0.5 font-mono">{node.sub}</div>
                </div>
                {i < 5 && <div className="w-6 h-px bg-[#2A2E4A] flex-shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 pt-4 border-t border-[#2A2E4A]">
            <div className="flex items-center gap-1.5 text-emerald-500 text-[12px] font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Pipeline finished · 2,847 rows · 1.2s
            </div>
            <div className="text-[11px] text-[#5B6480] ml-auto font-mono">↓ Export CSV &nbsp;|&nbsp; ↓ Export JSON</div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="border-y border-[#2A2E4A] py-5 bg-[#161829]/40">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-[13px] text-[#5B6480]">
          {["Built on the same transform logic as Informatica IICS", "16 transform types", "AI-powered pipeline generation", "Team workspaces", "API trigger endpoint", "Slack failure alerts"].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="text-[#8B7FFF]">✓</span> {item}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Everything a data team needs</h2>
          <p className="text-[#8B8FB0] max-w-xl mx-auto">Not a toy pipeline builder. Real ETL — the kind your data engineers would build with Informatica or dbt, without needing your data engineers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "⚡", title: "Visual pipeline designer", desc: "Drag nodes onto a canvas, wire them together, and configure each transform in a side panel. No YAML, no Python, no SQL." },
            { icon: "🤖", title: "AI pipeline generation", desc: "Describe what you want in plain English — \"dedupe by email, drop nulls, sort by revenue\" — and the AI builds the full pipeline, configured and ready to run." },
            { icon: "💬", title: "Conversational copilot", desc: "After your pipeline is built, chat with the copilot to modify it: \"now also filter out rows where status is pending\" — it proposes the change, you approve it." },
            { icon: "📊", title: "Data profiling", desc: "Upload a CSV and instantly see column types, null percentages, distinct counts, and top values — before you've built a single transform." },
            { icon: "🔁", title: "Schedules + Taskflows", desc: "Run pipelines on a cron schedule (daily at 9am IST, every 30 minutes, etc.) or chain multiple pipelines into a Taskflow with failure handling." },
            { icon: "🔌", title: "API trigger", desc: "Trigger any pipeline via a single HTTP POST with an API key. Works from cron jobs, GitHub Actions, Zapier, or your own backend." },
            { icon: "🏢", title: "Team workspaces", desc: "Invite your team to a shared workspace. Every pipeline, connection, and schedule is shared — switch between personal and team context in one click." },
            { icon: "🌍", title: "Environment promotion", desc: "Promote a pipeline from DEV → SIT → PROD with one click. View a visual diff of exactly what changed between environments." },
            { icon: "🔔", title: "Slack failure alerts", desc: "Connect a Slack webhook and get notified the moment a pipeline fails — whether it ran directly, via a Taskflow, or via a Schedule." },
          ].map((f) => (
            <div key={f.title} className="bg-[#161829] border border-[#2A2E4A] rounded-2xl p-5 hover:border-[#8B7FFF44] transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[15px] mb-1.5" style={{ fontFamily: "'Space Grotesk'" }}>{f.title}</h3>
              <p className="text-[13px] text-[#8B8FB0] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRANSFORMS */}
      <section id="transforms" className="bg-[#161829] border-y border-[#2A2E4A] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>16 enterprise-grade transforms</h2>
            <p className="text-[#8B8FB0]">The same building blocks data engineers use in Informatica IICS — available to everyone.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Source", "CSV upload or live DB connection", "#5B9CF6"],
              ["Filter", "Row-level conditions", "#8B7FFF"],
              ["Rename", "Standardize column names", "#8B7FFF"],
              ["Deduplicate", "Remove duplicate rows", "#8B7FFF"],
              ["Handle Nulls", "Drop or fill missing values", "#8B7FFF"],
              ["Expression", "Add computed columns", "#8B7FFF"],
              ["Sequence Generator", "Auto-increment ID columns", "#8B7FFF"],
              ["Sorter", "Order rows by any column", "#8B7FFF"],
              ["Rank", "Add a rank column by value", "#8B7FFF"],
              ["Aggregator", "Group by + sum/avg/count", "#8B7FFF"],
              ["Router", "Split rows by condition", "#D98A1E"],
              ["Union", "Combine two datasets", "#D98A1E"],
              ["Joiner", "Join two datasets on a key", "#D98A1E"],
              ["Lookup", "Enrich rows from a reference", "#D98A1E"],
              ["Update Strategy", "SCD Type 1/2 change detection", "#D98A1E"],
              ["Target", "Preview, export, or write to DB", "#1FA971"],
            ].map(([name, desc, color]) => (
              <div key={name} className="bg-[#0E0F1A] border border-[#2A2E4A] rounded-xl p-3.5" style={{ borderTopColor: color as string, borderTopWidth: 2 }}>
                <div className="text-[13px] font-semibold text-white mb-0.5">{name}</div>
                <div className="text-[11px] text-[#5B6480]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Built for real problems</h2>
          <p className="text-[#8B8FB0]">Not another toy CSV cleaner — CogniFlow handles the data work that used to need a data engineer.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { role: "Data Analysts", icon: "📈", items: ["Clean and reshape exported CSVs without Excel", "Deduplicate customer lists before campaigns", "Aggregate raw event data into summary reports", "Profile a new dataset before building any logic"] },
            { role: "Data Engineers", icon: "⚙️", items: ["Prototype ETL logic visually before scripting", "Build DEV pipelines and promote to SIT/PROD", "Schedule recurring loads with timezone awareness", "Trigger pipeline runs from CI/CD via API key"] },
            { role: "Business Teams", icon: "💼", items: ["Prep monthly finance reports without IT help", "Clean HR exports before loading to HRIS", "Merge product inventory exports from multiple systems", "Build and run pipelines without writing a single line of code"] },
            { role: "Startups & Freelancers", icon: "🚀", items: ["Replace one-off Python ETL scripts", "Deliver data integration work to clients faster", "Give clients a UI to run their own pipelines", "Invoice for something that runs and monitors itself"] },
          ].map((uc) => (
            <div key={uc.role} className="bg-[#161829] border border-[#2A2E4A] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-2xl">{uc.icon}</span>
                <h3 className="font-semibold text-[15px]" style={{ fontFamily: "'Space Grotesk'" }}>{uc.role}</h3>
              </div>
              <ul className="space-y-2">
                {uc.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-[#8B8FB0]">
                    <span className="text-[#8B7FFF] mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-[#161829] border-y border-[#2A2E4A] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Simple pricing</h2>
            <p className="text-[#8B8FB0]">Start free. Upgrade when your team needs more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "$0", period: "forever", desc: "For individuals exploring the tool", features: ["3 pipelines", "100 rows/run", "CSV export", "Data profiling", "AI suggestions", "Community support"], cta: "Get started free", highlight: false },
              { name: "Pro", price: "$29", period: "per month", desc: "For individuals and small teams doing real work", features: ["Unlimited pipelines", "Unlimited rows", "Scheduling + Taskflows", "Slack alerts", "API trigger", "Environment promotion", "Priority support"], cta: "Start Pro →", highlight: true },
              { name: "Team", price: "$99", period: "per month", desc: "For data teams that need to collaborate", features: ["Everything in Pro", "Team workspaces", "Up to 10 members", "Shared connections", "Shared pipelines & schedules", "Dedicated support"], cta: "Contact us", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? "border-[#8B7FFF] bg-[#8B7FFF0A]" : "border-[#2A2E4A] bg-[#0E0F1A]"}`}>
                {plan.highlight && (
                  <div className="text-[10.5px] font-semibold text-[#8B7FFF] bg-[#8B7FFF22] rounded-full px-2.5 py-0.5 inline-block mb-3">MOST POPULAR</div>
                )}
                <h3 className="font-bold text-[18px] mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-[#5B6480] text-sm">/ {plan.period}</span>
                </div>
                <p className="text-[12.5px] text-[#5B6480] mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[#8B8FB0]">
                      <span className="text-emerald-500 flex-shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {userId ? (
                  <Link href="/dashboard" className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90 ${plan.highlight ? "bg-[#8B7FFF] text-[#12102A]" : "border border-[#2A2E4A] text-[#C4CBDC] hover:border-[#8B7FFF]"}`}>
                    {plan.cta}
                  </Link>
                ) : (
                  <SignUpButton mode="modal" appearance={clerkAppearance}>
                    <button className={`w-full text-sm font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90 ${plan.highlight ? "bg-[#8B7FFF] text-[#12102A]" : "border border-[#2A2E4A] text-[#C4CBDC] hover:border-[#8B7FFF]"}`}>
                      {plan.cta}
                    </button>
                  </SignUpButton>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-[12.5px] text-[#5B6480] mt-6">
            Billing not yet active — all features available free during early access. Pricing above is indicative.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-3xl mx-auto text-center py-24 px-6">
        <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
          Your first pipeline in<br />
          <span className="bg-gradient-to-r from-[#8B7FFF] to-[#5B9CF6] bg-clip-text text-transparent">under 5 minutes.</span>
        </h2>
        <p className="text-[#8B8FB0] mb-8 text-lg">No setup. No credit card. Start with a template or describe what you want and let the AI build it.</p>
        {userId ? (
          <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-4 rounded-xl text-[15px] hover:opacity-90 transition-opacity inline-block">
            Go to your dashboard →
          </Link>
        ) : (
          <SignUpButton mode="modal" appearance={clerkAppearance}>
            <button className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-4 rounded-xl text-[15px] hover:opacity-90 transition-opacity">
              Start building free →
            </button>
          </SignUpButton>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2A2E4A] py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-[15px]" style={{ fontFamily: "'Space Grotesk'" }}>
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#8B7FFF] to-[#5B9CF6]" />
            CogniFlow
          </div>
          <div className="flex gap-6 text-[13px] text-[#5B6480]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#transforms" className="hover:text-white transition-colors">Transforms</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/dashboard/templates" className="hover:text-white transition-colors">Templates</Link>
          </div>
          <p className="text-[12px] text-[#5B6480]">© 2026 CogniFlow · Built by Aryan Hedaoo</p>
        </div>
      </footer>

    </main>
  );
}