// import Link from "next/link";
// import { auth } from "@clerk/nextjs/server";
// import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
// import { clerkAppearance } from "@/lib/clerkAppearance";
// //import { ThemeToggle } from "@/components/ThemeProvider";

// export default async function Home() {
//   const { userId } = await auth();

//   return (
//     <main className="min-h-screen bg-[#0E0F1A] text-[#EAEBF5] overflow-x-hidden">

//       {/* NAV */}
//       <nav className="flex items-center justify-between px-8 h-16 border-b border-[#2A2E4A] sticky top-0 bg-[#0E0F1A]/90 backdrop-blur z-50">
//         <div className="flex items-center gap-2 font-bold text-[17px]" style={{ fontFamily: "'Space Grotesk'" }}>
//           <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B7FFF] to-[#5B9CF6]" />
//           CogniFlow
//         </div>
//         <div className="hidden md:flex items-center gap-6 text-[13.5px] text-[#8B8FB0]">
//           <a href="#features" className="hover:text-white transition-colors">Features</a>
//           <a href="#transforms" className="hover:text-white transition-colors">Transforms</a>
//           <a href="#usecases" className="hover:text-white transition-colors">Use cases</a>
//           <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
//         </div>
//         <div className="flex items-center gap-3">
//           {/* <ThemeToggle className="border-[#2A2E4A] bg-transparent text-[#8B8FB0] hover:text-white hover:bg-[#161829]" /> */}
//             {userId ? (
//             <>
//               <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-semibold text-sm px-4 py-2 rounded-lg">
//                 Open dashboard
//               </Link>
//               <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
//             </>
//           ) : (
//             <>
//               <SignInButton mode="modal" appearance={clerkAppearance}>
//                 <button className="text-[#C4CBDC] font-semibold text-sm px-4 py-2 rounded-lg hover:text-white">Sign in</button>
//               </SignInButton>
//               <SignUpButton mode="modal" appearance={clerkAppearance}>
//                 <button className="bg-[#8B7FFF] text-[#12102A] font-semibold text-sm px-4 py-2 rounded-lg">Get started free</button>
//               </SignUpButton>
//             </>
//           )}
//         </div>
//       </nav>

//       {/* HERO */}
//       <section className="relative max-w-5xl mx-auto text-center pt-24 pb-20 px-6">
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#8B7FFF] opacity-[0.07] blur-[100px] rounded-full pointer-events-none" />
//         <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B7FFF] border border-[#8B7FFF33] bg-[#8B7FFF14] rounded-full px-3 py-1.5 mb-6">
//           ✦ NO-CODE ETL PLATFORM FOR DATA TEAMS
//         </div>
//         <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
//           Enterprise ETL transforms.<br />
//           <span className="bg-gradient-to-r from-[#8B7FFF] to-[#5B9CF6] bg-clip-text text-transparent">
//             No code. No scripts. No BS.
//           </span>
//         </h1>
//         <p className="text-lg text-[#8B8FB0] max-w-2xl mx-auto mb-4 leading-relaxed">
//           CogniFlow gives you the power of Informatica IICS — Filter, Joiner, Lookup, Aggregator, SCD Update Strategy —
//           in a drag-and-drop canvas your whole team can use. Build in minutes. Run on demand or on a schedule.
//           Trigger from your own code via API.
//         </p>
//         <p className="text-sm text-[#5B6480] mb-10">No credit card required · Free tier available · Teams supported</p>
//         <div className="flex flex-col sm:flex-row justify-center gap-3 mb-16">
//           {userId ? (
//             <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-3.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity">
//               Go to your dashboard →
//             </Link>
//           ) : (
//             <>
//               <SignUpButton mode="modal" appearance={clerkAppearance}>
//                 <button className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-3.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity">
//                   Start building free →
//                 </button>
//               </SignUpButton>
//               <Link href="/dashboard/templates" className="border border-[#2A2E4A] px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:border-[#8B7FFF] transition-colors">
//                 Browse templates
//               </Link>
//             </>
//           )}
//         </div>

//         {/* pipeline preview mockup */}
//         <div className="relative bg-[#161829] border border-[#2A2E4A] rounded-2xl p-6 text-left shadow-2xl shadow-black/40 max-w-3xl mx-auto">
//           <div className="flex items-center gap-2 mb-5">
//             <div className="w-3 h-3 rounded-full bg-red-500/60" />
//             <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
//             <div className="w-3 h-3 rounded-full bg-green-500/60" />
//             <span className="text-[11px] font-mono text-[#5B6480] ml-2">CogniFlow Designer — Customer Data Cleanup</span>
//           </div>
//           <div className="flex items-center gap-2 overflow-x-auto pb-2">
//             {[
//               { label: "Source", color: "#5B9CF6", sub: "customers.csv" },
//               { label: "Handle Nulls", color: "#8B7FFF", sub: "drop empty emails" },
//               { label: "Deduplicate", color: "#8B7FFF", sub: "by email" },
//               { label: "Filter", color: "#8B7FFF", sub: "status = active" },
//               { label: "Aggregator", color: "#8B7FFF", sub: "sum order_value" },
//               { label: "Target", color: "#1FA971", sub: "customers_clean" },
//             ].map((node, i) => (
//               <div key={node.label} className="flex items-center gap-2 flex-shrink-0">
//                 <div className="bg-[#0E0F1A] border border-[#2A2E4A] rounded-xl px-4 py-3 min-w-[130px]" style={{ borderTopColor: node.color, borderTopWidth: 2 }}>
//                   <div className="text-[12.5px] font-semibold text-white">{node.label}</div>
//                   <div className="text-[10.5px] text-[#5B6480] mt-0.5 font-mono">{node.sub}</div>
//                 </div>
//                 {i < 5 && <div className="w-6 h-px bg-[#2A2E4A] flex-shrink-0" />}
//               </div>
//             ))}
//           </div>
//           <div className="mt-4 flex items-center gap-3 pt-4 border-t border-[#2A2E4A]">
//             <div className="flex items-center gap-1.5 text-emerald-500 text-[12px] font-semibold">
//               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Pipeline finished · 2,847 rows · 1.2s
//             </div>
//             <div className="text-[11px] text-[#5B6480] ml-auto font-mono">↓ Export CSV &nbsp;|&nbsp; ↓ Export JSON</div>
//           </div>
//         </div>
//       </section>

//       {/* SOCIAL PROOF STRIP */}
//       <section className="border-y border-[#2A2E4A] py-5 bg-[#161829]/40">
//         <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-[13px] text-[#5B6480]">
//           {["Built on the same transform logic as Informatica IICS", "16 transform types", "AI-powered pipeline generation", "Team workspaces", "API trigger endpoint", "Slack failure alerts"].map((item) => (
//             <span key={item} className="flex items-center gap-2">
//               <span className="text-[#8B7FFF]">✓</span> {item}
//             </span>
//           ))}
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section id="features" className="max-w-5xl mx-auto px-6 py-24">
//         <div className="text-center mb-14">
//           <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Everything a data team needs</h2>
//           <p className="text-[#8B8FB0] max-w-xl mx-auto">Not a toy pipeline builder. Real ETL — the kind your data engineers would build with Informatica or dbt, without needing your data engineers.</p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           {[
//             { icon: "⚡", title: "Visual pipeline designer", desc: "Drag nodes onto a canvas, wire them together, and configure each transform in a side panel. No YAML, no Python, no SQL." },
//             { icon: "🤖", title: "AI pipeline generation", desc: "Describe what you want in plain English — \"dedupe by email, drop nulls, sort by revenue\" — and the AI builds the full pipeline, configured and ready to run." },
//             { icon: "💬", title: "Conversational copilot", desc: "After your pipeline is built, chat with the copilot to modify it: \"now also filter out rows where status is pending\" — it proposes the change, you approve it." },
//             { icon: "📊", title: "Data profiling", desc: "Upload a CSV and instantly see column types, null percentages, distinct counts, and top values — before you've built a single transform." },
//             { icon: "🔁", title: "Schedules + Taskflows", desc: "Run pipelines on a cron schedule (daily at 9am IST, every 30 minutes, etc.) or chain multiple pipelines into a Taskflow with failure handling." },
//             { icon: "🔌", title: "API trigger", desc: "Trigger any pipeline via a single HTTP POST with an API key. Works from cron jobs, GitHub Actions, Zapier, or your own backend." },
//             { icon: "🏢", title: "Team workspaces", desc: "Invite your team to a shared workspace. Every pipeline, connection, and schedule is shared — switch between personal and team context in one click." },
//             { icon: "🌍", title: "Environment promotion", desc: "Promote a pipeline from DEV → SIT → PROD with one click. View a visual diff of exactly what changed between environments." },
//             { icon: "🔔", title: "Slack failure alerts", desc: "Connect a Slack webhook and get notified the moment a pipeline fails — whether it ran directly, via a Taskflow, or via a Schedule." },
//           ].map((f) => (
//             <div key={f.title} className="bg-[#161829] border border-[#2A2E4A] rounded-2xl p-5 hover:border-[#8B7FFF44] transition-colors">
//               <div className="text-2xl mb-3">{f.icon}</div>
//               <h3 className="font-semibold text-[15px] mb-1.5" style={{ fontFamily: "'Space Grotesk'" }}>{f.title}</h3>
//               <p className="text-[13px] text-[#8B8FB0] leading-relaxed">{f.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* TRANSFORMS */}
//       <section id="transforms" className="bg-[#161829] border-y border-[#2A2E4A] py-20">
//         <div className="max-w-5xl mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>16 enterprise-grade transforms</h2>
//             <p className="text-[#8B8FB0]">The same building blocks data engineers use in Informatica IICS — available to everyone.</p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             {[
//               ["Source", "CSV upload or live DB connection", "#5B9CF6"],
//               ["Filter", "Row-level conditions", "#8B7FFF"],
//               ["Rename", "Standardize column names", "#8B7FFF"],
//               ["Deduplicate", "Remove duplicate rows", "#8B7FFF"],
//               ["Handle Nulls", "Drop or fill missing values", "#8B7FFF"],
//               ["Expression", "Add computed columns", "#8B7FFF"],
//               ["Sequence Generator", "Auto-increment ID columns", "#8B7FFF"],
//               ["Sorter", "Order rows by any column", "#8B7FFF"],
//               ["Rank", "Add a rank column by value", "#8B7FFF"],
//               ["Aggregator", "Group by + sum/avg/count", "#8B7FFF"],
//               ["Router", "Split rows by condition", "#D98A1E"],
//               ["Union", "Combine two datasets", "#D98A1E"],
//               ["Joiner", "Join two datasets on a key", "#D98A1E"],
//               ["Lookup", "Enrich rows from a reference", "#D98A1E"],
//               ["Update Strategy", "SCD Type 1/2 change detection", "#D98A1E"],
//               ["Target", "Preview, export, or write to DB", "#1FA971"],
//             ].map(([name, desc, color]) => (
//               <div key={name} className="bg-[#0E0F1A] border border-[#2A2E4A] rounded-xl p-3.5" style={{ borderTopColor: color as string, borderTopWidth: 2 }}>
//                 <div className="text-[13px] font-semibold text-white mb-0.5">{name}</div>
//                 <div className="text-[11px] text-[#5B6480]">{desc}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* USE CASES */}
//       <section id="usecases" className="max-w-5xl mx-auto px-6 py-24">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Built for real problems</h2>
//           <p className="text-[#8B8FB0]">Not another toy CSV cleaner — CogniFlow handles the data work that used to need a data engineer.</p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           {[
//             { role: "Data Analysts", icon: "📈", items: ["Clean and reshape exported CSVs without Excel", "Deduplicate customer lists before campaigns", "Aggregate raw event data into summary reports", "Profile a new dataset before building any logic"] },
//             { role: "Data Engineers", icon: "⚙️", items: ["Prototype ETL logic visually before scripting", "Build DEV pipelines and promote to SIT/PROD", "Schedule recurring loads with timezone awareness", "Trigger pipeline runs from CI/CD via API key"] },
//             { role: "Business Teams", icon: "💼", items: ["Prep monthly finance reports without IT help", "Clean HR exports before loading to HRIS", "Merge product inventory exports from multiple systems", "Build and run pipelines without writing a single line of code"] },
//             { role: "Startups & Freelancers", icon: "🚀", items: ["Replace one-off Python ETL scripts", "Deliver data integration work to clients faster", "Give clients a UI to run their own pipelines", "Invoice for something that runs and monitors itself"] },
//           ].map((uc) => (
//             <div key={uc.role} className="bg-[#161829] border border-[#2A2E4A] rounded-2xl p-6">
//               <div className="flex items-center gap-2.5 mb-4">
//                 <span className="text-2xl">{uc.icon}</span>
//                 <h3 className="font-semibold text-[15px]" style={{ fontFamily: "'Space Grotesk'" }}>{uc.role}</h3>
//               </div>
//               <ul className="space-y-2">
//                 {uc.items.map((item) => (
//                   <li key={item} className="flex items-start gap-2 text-[13px] text-[#8B8FB0]">
//                     <span className="text-[#8B7FFF] mt-0.5 flex-shrink-0">→</span>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* PRICING */}
//       <section id="pricing" className="bg-[#161829] border-y border-[#2A2E4A] py-20">
//         <div className="max-w-4xl mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Simple pricing</h2>
//             <p className="text-[#8B8FB0]">Start free. Upgrade when your team needs more.</p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//             {[
//               { name: "Free", price: "$0", period: "forever", desc: "For individuals exploring the tool", features: ["3 pipelines", "100 rows/run", "CSV export", "Data profiling", "AI suggestions", "Community support"], cta: "Get started free", highlight: false },
//               { name: "Pro", price: "$29", period: "per month", desc: "For individuals and small teams doing real work", features: ["Unlimited pipelines", "Unlimited rows", "Scheduling + Taskflows", "Slack alerts", "API trigger", "Environment promotion", "Priority support"], cta: "Start Pro →", highlight: true },
//               { name: "Team", price: "$99", period: "per month", desc: "For data teams that need to collaborate", features: ["Everything in Pro", "Team workspaces", "Up to 10 members", "Shared connections", "Shared pipelines & schedules", "Dedicated support"], cta: "Contact us", highlight: false },
//             ].map((plan) => (
//               <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? "border-[#8B7FFF] bg-[#8B7FFF0A]" : "border-[#2A2E4A] bg-[#0E0F1A]"}`}>
//                 {plan.highlight && (
//                   <div className="text-[10.5px] font-semibold text-[#8B7FFF] bg-[#8B7FFF22] rounded-full px-2.5 py-0.5 inline-block mb-3">MOST POPULAR</div>
//                 )}
//                 <h3 className="font-bold text-[18px] mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{plan.name}</h3>
//                 <div className="flex items-baseline gap-1 mb-1">
//                   <span className="text-3xl font-bold">{plan.price}</span>
//                   <span className="text-[#5B6480] text-sm">/ {plan.period}</span>
//                 </div>
//                 <p className="text-[12.5px] text-[#5B6480] mb-5">{plan.desc}</p>
//                 <ul className="space-y-2 mb-6">
//                   {plan.features.map((f) => (
//                     <li key={f} className="flex items-center gap-2 text-[13px] text-[#8B8FB0]">
//                       <span className="text-emerald-500 flex-shrink-0">✓</span> {f}
//                     </li>
//                   ))}
//                 </ul>
//                 {userId ? (
//                   <Link href="/dashboard" className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90 ${plan.highlight ? "bg-[#8B7FFF] text-[#12102A]" : "border border-[#2A2E4A] text-[#C4CBDC] hover:border-[#8B7FFF]"}`}>
//                     {plan.cta}
//                   </Link>
//                 ) : (
//                   <SignUpButton mode="modal" appearance={clerkAppearance}>
//                     <button className={`w-full text-sm font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90 ${plan.highlight ? "bg-[#8B7FFF] text-[#12102A]" : "border border-[#2A2E4A] text-[#C4CBDC] hover:border-[#8B7FFF]"}`}>
//                       {plan.cta}
//                     </button>
//                   </SignUpButton>
//                 )}
//               </div>
//             ))}
//           </div>
//           <p className="text-center text-[12.5px] text-[#5B6480] mt-6">
//             Billing not yet active — all features available free during early access. Pricing above is indicative.
//           </p>
//         </div>
//       </section>

//       {/* FINAL CTA */}
//       <section className="max-w-3xl mx-auto text-center py-24 px-6">
//         <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
//           Your first pipeline in<br />
//           <span className="bg-gradient-to-r from-[#8B7FFF] to-[#5B9CF6] bg-clip-text text-transparent">under 5 minutes.</span>
//         </h2>
//         <p className="text-[#8B8FB0] mb-8 text-lg">No setup. No credit card. Start with a template or describe what you want and let the AI build it.</p>
//         {userId ? (
//           <Link href="/dashboard" className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-4 rounded-xl text-[15px] hover:opacity-90 transition-opacity inline-block">
//             Go to your dashboard →
//           </Link>
//         ) : (
//           <SignUpButton mode="modal" appearance={clerkAppearance}>
//             <button className="bg-[#8B7FFF] text-[#12102A] font-bold px-8 py-4 rounded-xl text-[15px] hover:opacity-90 transition-opacity">
//               Start building free →
//             </button>
//           </SignUpButton>
//         )}
//       </section>

//       {/* FOOTER */}
//       <footer className="border-t border-[#2A2E4A] py-10 px-8">
//         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-2 font-bold text-[15px]" style={{ fontFamily: "'Space Grotesk'" }}>
//             <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#8B7FFF] to-[#5B9CF6]" />
//             CogniFlow
//           </div>
//           <div className="flex gap-6 text-[13px] text-[#5B6480]">
//             <a href="#features" className="hover:text-white transition-colors">Features</a>
//             <a href="#transforms" className="hover:text-white transition-colors">Transforms</a>
//             <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
//             <Link href="/dashboard/templates" className="hover:text-white transition-colors">Templates</Link>
//           </div>
//           <p className="text-[12px] text-[#5B6480]">© 2026 CogniFlow · Built by Aryan Hedaoo</p>
//         </div>
//       </footer>

//     </main>
//   );
// }

// "use client";
// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";

// // ─── Animated pipeline node ────────────────────────────────────────────────
// function PipelineNode({ label, type, x, y, delay = 0, active = false }: {
//   label: string; type: string; x: number; y: number; delay?: number; active?: boolean;
// }) {
//   const colors: Record<string, { border: string; glow: string; dot: string }> = {
//     source:  { border: "#3B82F6", glow: "#3B82F620", dot: "#3B82F6" },
//     transform: { border: "#7C6AE8", glow: "#7C6AE820", dot: "#7C6AE8" },
//     target:  { border: "#10B981", glow: "#10B98120", dot: "#10B981" },
//   };
//   const c = colors[type] || colors.transform;
//   return (
//     <g transform={`translate(${x}, ${y})`} style={{ animation: `fadeSlideIn 0.6s ease ${delay}s both` }}>
//       <rect x={-60} y={-22} width={120} height={44} rx={10}
//         fill="#0F1629" stroke={c.border} strokeWidth={active ? 1.5 : 1}
//         style={{ filter: active ? `drop-shadow(0 0 8px ${c.border})` : "none" }} />
//       <circle cx={-48} cy={0} r={5} fill={c.dot}
//         style={{ animation: active ? "pulse 2s infinite" : "none" }} />
//       <text x={-36} y={4} fill="white" fontSize={11} fontFamily="monospace" fontWeight={500}>{label}</text>
//       <text x={-48} y={18} fill={c.dot} fontSize={8} fontFamily="monospace" opacity={0.7}>{type}</text>
//     </g>
//   );
// }

// // ─── Animated wire ─────────────────────────────────────────────────────────
// function Wire({ x1, y1, x2, y2, delay = 0, color = "#2F6FED" }: {
//   x1: number; y1: number; x2: number; y2: number; delay?: number; color?: string;
// }) {
//   const mx = (x1 + x2) / 2;
//   const d = `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
//   return (
//     <g>
//       <path d={d} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
//       <path d={d} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8}
//         strokeDasharray="120" strokeDashoffset="120"
//         style={{ animation: `drawLine 1s ease ${delay}s forwards` }} />
//       {/* flowing dot */}
//       <circle r={3} fill={color} opacity={0.9}>
//         <animateMotion dur="3s" repeatCount="indefinite" begin={`${delay}s`}>
//           <mpath href={`#wire-${x1}-${x2}`} />
//         </animateMotion>
//       </circle>
//       <path id={`wire-${x1}-${x2}`} d={d} fill="none" />
//     </g>
//   );
// }

// // ─── 3D rotating cube (CSS) ─────────────────────────────────────────────────
// function DataCube({ size = 40, color = "#2F6FED", x = 0, y = 0, speed = 8 }: {
//   size?: number; color?: string; x?: number; y?: number; speed?: number;
// }) {
//   return (
//     <div style={{
//       position: "absolute", left: x, top: y,
//       width: size, height: size,
//       transformStyle: "preserve-3d",
//       animation: `rotateCube ${speed}s linear infinite`,
//       perspective: 600,
//     }}>
//       {["front","back","left","right","top","bottom"].map((face, i) => (
//         <div key={face} style={{
//           position: "absolute", width: size, height: size,
//           border: `1px solid ${color}44`,
//           background: `${color}08`,
//           backdropFilter: "blur(2px)",
//           transform: [
//             `translateZ(${size/2}px)`,
//             `translateZ(-${size/2}px) rotateY(180deg)`,
//             `translateX(-${size/2}px) rotateY(-90deg)`,
//             `translateX(${size/2}px) rotateY(90deg)`,
//             `translateY(-${size/2}px) rotateX(90deg)`,
//             `translateY(${size/2}px) rotateX(-90deg)`,
//           ][i],
//         }} />
//       ))}
//     </div>
//   );
// }

// // ─── Stat counter ──────────────────────────────────────────────────────────
// function StatCounter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
//   const [count, setCount] = useState(0);
//   const ref = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     const observer = new IntersectionObserver(([e]) => {
//       if (e.isIntersecting) {
//         let start = 0;
//         const duration = 2000;
//         const step = end / (duration / 16);
//         const timer = setInterval(() => {
//           start = Math.min(start + step, end);
//           setCount(Math.floor(start));
//           if (start >= end) clearInterval(timer);
//         }, 16);
//         observer.disconnect();
//       }
//     });
//     if (ref.current) observer.observe(ref.current);
//     return () => observer.disconnect();
//   }, [end]);
//   return (
//     <div ref={ref} className="text-center">
//       <div className="text-4xl font-bold text-white tabular-nums">
//         {count.toLocaleString()}{suffix}
//       </div>
//       <div className="text-[#8B93AC] text-sm mt-1">{label}</div>
//     </div>
//   );
// }

// // ─── Main landing page ─────────────────────────────────────────────────────
// export default function LandingPage() {
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//   const heroRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function onMouse(e: MouseEvent) {
//       setMousePos({ x: e.clientX, y: e.clientY });
//     }
//     window.addEventListener("mousemove", onMouse);
//     return () => window.removeEventListener("mousemove", onMouse);
//   }, []);

//   const parallaxX = (mousePos.x - window.innerWidth / 2) / 80;
//   const parallaxY = (mousePos.y - window.innerHeight / 2) / 80;

//   return (
//     <div className="min-h-screen bg-[#060B18] text-white overflow-x-hidden">
//       <style>{`
//         @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
//         @keyframes drawLine { to { stroke-dashoffset: 0; } }
//         @keyframes rotateCube { from { transform: rotateX(0deg) rotateY(0deg); } to { transform: rotateX(360deg) rotateY(360deg); } }
//         @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
//         @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
//         @keyframes gridMove { from { transform: translateY(0); } to { transform: translateY(40px); } }
//         @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
//         @keyframes orb { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-20px) scale(1.05); } 66% { transform:translate(-20px,15px) scale(0.95); } }
//         @keyframes scanline { 0% { top: 0%; } 100% { top: 100%; } }
//         .shimmer-text {
//           background: linear-gradient(90deg, #fff 0%, #fff 30%, #7C6AE8 50%, #fff 70%, #fff 100%);
//           background-size: 200% auto;
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           animation: shimmer 4s linear infinite;
//         }
//       `}</style>

//       {/* ── NAV ── */}
//       <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
//         style={{ background: "linear-gradient(180deg, rgba(6,11,24,0.95) 0%, transparent 100%)", backdropFilter: "blur(12px)" }}>
//         <div className="flex items-center gap-2.5">
//           <div className="w-8 h-8 rounded-lg" style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)" }} />
//           <span className="text-white font-bold text-[17px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CogniFlow</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <Link href="/sign-in" className="text-[#8B93AC] hover:text-white text-sm font-medium transition-colors px-4 py-2">
//             Sign in
//           </Link>
//           <Link href="/sign-up"
//             className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105"
//             style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)", boxShadow: "0 0 20px #2F6FED40" }}>
//             Get started free
//           </Link>
//         </div>
//       </nav>

//       {/* ── HERO ── */}
//       <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
//         {/* Animated grid background */}
//         <div className="absolute inset-0" style={{ perspective: "800px" }}>
//           <svg className="absolute inset-0 w-full h-full opacity-[0.07]" style={{ animation: "gridMove 4s linear infinite" }}>
//             <defs>
//               <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
//                 <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#2F6FED" strokeWidth="0.5" />
//               </pattern>
//             </defs>
//             <rect width="200%" height="200%" fill="url(#grid)" />
//           </svg>
//         </div>

//         {/* Glowing orbs */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div style={{
//             position: "absolute", width: 600, height: 600, borderRadius: "50%",
//             background: "radial-gradient(circle, #2F6FED18 0%, transparent 70%)",
//             top: "10%", left: "20%", animation: "orb 12s ease infinite",
//           }} />
//           <div style={{
//             position: "absolute", width: 400, height: 400, borderRadius: "50%",
//             background: "radial-gradient(circle, #7C6AE820 0%, transparent 70%)",
//             bottom: "20%", right: "25%", animation: "orb 15s ease infinite reverse",
//           }} />
//           <div style={{
//             position: "absolute", width: 300, height: 300, borderRadius: "50%",
//             background: "radial-gradient(circle, #10B98115 0%, transparent 70%)",
//             top: "60%", left: "10%", animation: "orb 10s ease infinite 3s",
//           }} />
//         </div>

//         {/* Floating 3D cubes */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: "1000px" }}>
//           <DataCube size={35} color="#2F6FED" x={80} y={120} speed={10} />
//           <DataCube size={24} color="#7C6AE8" x={180} y={300} speed={14} />
//           <DataCube size={18} color="#10B981" x={90} y={480} speed={8} />
//           <DataCube size={28} color="#2F6FED" x={window?.innerWidth - 160 || 1100} y={150} speed={12} />
//           <DataCube size={20} color="#7C6AE8" x={window?.innerWidth - 100 || 1200} y={350} speed={9} />
//           <DataCube size={32} color="#10B981" x={window?.innerWidth - 200 || 1060} y={500} speed={11} />
//         </div>

//         {/* Mouse-parallax pipeline diagram */}
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
//           style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)`, transition: "transform 0.1s ease-out" }}>
//           <svg width="700" height="280" viewBox="0 0 700 280" className="opacity-60">
//             <Wire x1={140} y1={100} x2={280} y2={100} delay={0.8} />
//             <Wire x1={420} y1={100} x2={560} y2={100} delay={1.2} />
//             <Wire x1={350} y1={122} x2={350} y2={158} delay={1.0} color="#7C6AE8" />
//             <PipelineNode label="CSV Source" type="source" x={80} y={100} delay={0.2} active />
//             <PipelineNode label="Handle Nulls" type="transform" x={350} y={100} delay={0.5} active />
//             <PipelineNode label="Warehouse" type="target" x={620} y={100} delay={0.8} />
//             <PipelineNode label="AI Clean" type="transform" x={350} y={180} delay={0.6} />
//           </svg>
//         </div>

//         {/* Hero content */}
//         <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ animation: "fadeSlideIn 0.8s ease 0.1s both" }}>
//           <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#2F6FED30] bg-[#2F6FED0A] mb-8">
//             <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
//             <span className="text-[#8B93AC] text-sm font-medium">No-code ETL · Enterprise-grade transforms</span>
//           </div>

//           <h1 className="text-6xl font-bold leading-[1.08] mb-6 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
//             <span className="text-white">Enterprise ETL,</span>
//             <br />
//             <span className="shimmer-text">built for engineers</span>
//           </h1>

//           <p className="text-[#8B93AC] text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
//             Design pipelines visually. SCD types 1, 2 &amp; 3. AI-powered transforms.
//             Environment promotion from DEV to PROD — everything Informatica does,
//             without the complexity or cost.
//           </p>

//           <div className="flex items-center justify-center gap-4 flex-wrap">
//             <Link href="/sign-up"
//               className="group flex items-center gap-2.5 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-2xl"
//               style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)", boxShadow: "0 0 30px #2F6FED50" }}>
//               Start building free
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
//                 <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </Link>
//             <Link href="/sign-in"
//               className="flex items-center gap-2 text-[#8B93AC] hover:text-white font-medium text-base px-6 py-4 rounded-2xl border border-[#2A3752] hover:border-[#2F6FED] transition-all">
//               Sign in →
//             </Link>
//           </div>

//           <div className="flex items-center justify-center gap-6 mt-8 text-[13px] text-[#5B6480]">
//             {["No credit card required", "Visual-first, code-optional", "From CSV to warehouse in minutes"].map((t, i) => (
//               <span key={i} className="flex items-center gap-1.5">
//                 <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
//                 {t}
//               </span>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── STATS ── */}
//       <section className="py-20 border-y border-[#1A2740]" style={{ background: "linear-gradient(180deg, #060B18 0%, #0B1220 100%)" }}>
//         <div className="max-w-4xl mx-auto px-6 grid grid-cols-4 gap-8">
//           <StatCounter end={22} suffix="+" label="Enterprise transforms" />
//           <StatCounter end={3} suffix="" label="SCD types supported" />
//           <StatCounter end={5} suffix="x" label="Faster than IICS setup" />
//           <StatCounter end={3} suffix=" envs" label="DEV → SIT → PROD" />
//         </div>
//       </section>

//       {/* ── FEATURES ── */}
//       <section className="py-24 px-6 max-w-6xl mx-auto">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
//             Built for real data engineering
//           </h2>
//           <p className="text-[#8B93AC] text-lg">The transforms you need, the speed you want.</p>
//         </div>

//         <div className="grid grid-cols-3 gap-5">
//           {[
//             {
//               icon: "⇢",
//               title: "Visual pipeline designer",
//               desc: "Drag nodes, draw wires, configure transforms — exactly like Informatica IICS but without the enterprise price tag.",
//               color: "#2F6FED",
//             },
//             {
//               icon: "✦",
//               title: "AI-powered transforms",
//               desc: "Upload a CSV, let AI profile it and suggest cleaning steps. Deduplicate, fill nulls, fix casing — one click.",
//               color: "#7C6AE8",
//             },
//             {
//               icon: "↻",
//               title: "SCD Type 1, 2 & 3",
//               desc: "Full slowly changing dimension support. Two-source pattern, snapshot comparison, surrogate key generation.",
//               color: "#10B981",
//             },
//             {
//               icon: "📅",
//               title: "Schedules & alerts",
//               desc: "Run pipelines on a cron, get email and Slack notifications on success or failure. Works with any provider.",
//               color: "#D98A1E",
//             },
//             {
//               icon: "🔀",
//               title: "Environment promotion",
//               desc: "Build in DEV, review in SIT, ship to PROD. Visual diff shows exactly what changed between environments.",
//               color: "#2F6FED",
//             },
//             {
//               icon: "⏱",
//               title: "Real-time run progress",
//               desc: "Watch your pipeline execute step by step. Live row counts, duration, and per-step status as it runs.",
//               color: "#7C6AE8",
//             },
//           ].map((f, i) => (
//             <div key={i} className="group relative rounded-2xl p-6 border border-[#1A2740] hover:border-opacity-60 transition-all duration-300"
//               style={{
//                 background: "linear-gradient(135deg, #0B1220 0%, #0F1629 100%)",
//                 animation: `fadeSlideIn 0.6s ease ${i * 0.1}s both`,
//               }}
//               onMouseEnter={e => {
//                 (e.currentTarget as HTMLElement).style.borderColor = f.color + "40";
//                 (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${f.color}15`;
//               }}
//               onMouseLeave={e => {
//                 (e.currentTarget as HTMLElement).style.borderColor = "#1A2740";
//                 (e.currentTarget as HTMLElement).style.boxShadow = "none";
//               }}>
//               <div className="text-3xl mb-4" style={{ color: f.color }}>{f.icon}</div>
//               <h3 className="text-white font-semibold text-[15px] mb-2">{f.title}</h3>
//               <p className="text-[#6B7A99] text-[13.5px] leading-relaxed">{f.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── PIPELINE DEMO ── */}
//       <section className="py-20 px-6" style={{ background: "linear-gradient(180deg, #060B18 0%, #0B1220 50%, #060B18 100%)" }}>
//         <div className="max-w-4xl mx-auto text-center mb-12">
//           <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
//             See it in action
//           </h2>
//           <p className="text-[#8B93AC]">A real pipeline — Source to target, with AI cleaning in between.</p>
//         </div>
//         <div className="max-w-3xl mx-auto rounded-2xl border border-[#1A2740] overflow-hidden"
//           style={{ background: "#080E1C", boxShadow: "0 0 60px #2F6FED15" }}>
//           {/* Terminal header */}
//           <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1A2740]">
//             <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
//             <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
//             <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
//             <span className="ml-2 text-[#5B6480] text-xs font-mono">Pipeline — employees_dirty.csv</span>
//           </div>
//           {/* Pipeline flow */}
//           <div className="p-8">
//             <svg width="100%" height="160" viewBox="0 0 700 160">
//               <Wire x1={130} y1={80} x2={250} y2={80} delay={0.3} />
//               <Wire x1={390} y1={80} x2={510} y2={80} delay={0.9} />
//               <Wire x1={320} y1={102} x2={320} y2={130} delay={0.6} color="#7C6AE8" />
//               <PipelineNode label="employees.csv" type="source" x={70} y={80} delay={0} active />
//               <PipelineNode label="AI Clean" type="transform" x={320} y={80} delay={0.4} active />
//               <PipelineNode label="Postgres DB" type="target" x={580} y={80} delay={0.8} />
//               <PipelineNode label="Deduplicate" type="transform" x={320} y={140} delay={0.5} />
//               {/* Stats */}
//               <text x={350} y={30} fill="#10B981" fontSize={10} fontFamily="monospace" textAnchor="middle">12 rows → 9 rows · 234ms</text>
//             </svg>
//           </div>
//           {/* Log output */}
//           <div className="px-8 pb-6 font-mono text-[12px] space-y-1">
//             {[
//               { ok: true, text: "✓ Source — 12 rows loaded from employees_dirty.csv" },
//               { ok: true, text: "✓ AI Clean — filled 3 nulls, fixed 2 case issues" },
//               { ok: true, text: "✓ Deduplicate — removed 3 duplicate rows" },
//               { ok: true, text: "✓ Target — 9 rows written to postgres.employees_clean" },
//             ].map((l, i) => (
//               <div key={i} style={{ color: l.ok ? "#10B981" : "#DA4B4B", animation: `fadeSlideIn 0.4s ease ${i * 0.3 + 1}s both`, opacity: 0 }}>
//                 {l.text}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ── */}
//       <section className="py-24 px-6 text-center">
//         <div className="max-w-2xl mx-auto">
//           <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
//             Ship your first pipeline today
//           </h2>
//           <p className="text-[#8B93AC] text-lg mb-10">
//             Free to start. No credit card. No vendor lock-in.<br />
//             Built by a data engineer, for data engineers.
//           </p>
//           <Link href="/sign-up"
//             className="inline-flex items-center gap-3 text-white font-semibold text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105"
//             style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)", boxShadow: "0 0 40px #2F6FED60" }}>
//             Start building for free
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path d="M4 10h12M12 6l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </Link>
//         </div>
//       </section>

//       {/* ── FOOTER ── */}
//       <footer className="border-t border-[#1A2740] py-8 px-8 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-6 h-6 rounded-md" style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)" }} />
//           <span className="text-[#5B6480] text-sm font-medium">CogniFlow</span>
//         </div>
//         <div className="text-[#3A4558] text-xs">Built by Aryan · Data Engineering Platform</div>
//       </footer>
//     </div>
//   );
// }


// "use client";
// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";

// export default function LandingPage() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [mounted, setMounted] = useState(false);
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//   const [scrollY, setScrollY] = useState(0);
//   const animRef = useRef<number>(0);

//   useEffect(() => {
//     setMounted(true);
//     const onScroll = () => setScrollY(window.scrollY);
//     const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
//     window.addEventListener("scroll", onScroll);
//     window.addEventListener("mousemove", onMouse);
//     return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
//   }, []);

//   // ── WebGL-style 3D particle field on canvas ──
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
//     window.addEventListener("resize", onResize);

//     // Nodes — represent data pipeline nodes floating in 3D space
//     const nodes: { x: number; y: number; z: number; vx: number; vy: number; vz: number; type: number; size: number; pulse: number }[] = [];
//     for (let i = 0; i < 80; i++) {
//       nodes.push({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         z: Math.random() * 1000,
//         vx: (Math.random() - 0.5) * 0.3,
//         vy: (Math.random() - 0.5) * 0.3,
//         vz: (Math.random() - 0.5) * 0.5,
//         type: Math.floor(Math.random() * 3), // 0=source, 1=transform, 2=target
//         size: Math.random() * 2 + 1,
//         pulse: Math.random() * Math.PI * 2,
//       });
//     }

//     const colors = ["#3B82F6", "#7C6AE8", "#10B981"];
//     let frame = 0;
//     let mx = canvas.width / 2, my = canvas.height / 2;

//     const onM = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
//     window.addEventListener("mousemove", onM);

//     function draw() {
//       animRef.current = requestAnimationFrame(draw);
//       frame++;
//       ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

//       // Deep space background gradient
//       const grad = ctx!.createRadialGradient(canvas!.width/2, canvas!.height/2, 0, canvas!.width/2, canvas!.height/2, canvas!.width * 0.8);
//       grad.addColorStop(0, "#0B1220");
//       grad.addColorStop(1, "#060B18");
//       ctx!.fillStyle = grad;
//       ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

//       // Mouse influence
//       const mdx = (mx - canvas!.width / 2) / canvas!.width;
//       const mdy = (my - canvas!.height / 2) / canvas!.height;

//       // Update and project nodes
//       const projected = nodes.map(n => {
//         n.x += n.vx + mdx * 0.1;
//         n.y += n.vy + mdy * 0.1;
//         n.z += n.vz;
//         n.pulse += 0.03;

//         // Wrap around
//         if (n.x < -50) n.x = canvas!.width + 50;
//         if (n.x > canvas!.width + 50) n.x = -50;
//         if (n.y < -50) n.y = canvas!.height + 50;
//         if (n.y > canvas!.height + 50) n.y = -50;
//         if (n.z < 0) n.z = 1000;
//         if (n.z > 1000) n.z = 0;

//         // 3D projection
//         const perspective = 800;
//         const scale = perspective / (perspective + n.z);
//         const px = (n.x - canvas!.width / 2) * scale + canvas!.width / 2;
//         const py = (n.y - canvas!.height / 2) * scale + canvas!.height / 2;
//         const size = n.size * scale * (1 + Math.sin(n.pulse) * 0.3);
//         const alpha = scale * 0.8;

//         return { px, py, size, alpha, type: n.type, z: n.z, ox: n.x, oy: n.y };
//       });

//       // Draw connections between close nodes
//       for (let i = 0; i < projected.length; i++) {
//         for (let j = i + 1; j < projected.length; j++) {
//           const a = projected[i], b = projected[j];
//           const dist = Math.hypot(a.px - b.px, a.py - b.py);
//           if (dist < 120) {
//             const alpha = (1 - dist / 120) * 0.15 * Math.min(a.alpha, b.alpha);
//             const color = colors[a.type];
//             ctx!.beginPath();
//             ctx!.moveTo(a.px, a.py);
//             ctx!.lineTo(b.px, b.py);
//             ctx!.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
//             ctx!.lineWidth = 0.5;
//             ctx!.stroke();
//           }
//         }
//       }

//       // Draw nodes
//       projected.forEach(n => {
//         const color = colors[n.type];
//         const r = n.size * 2;
//         // Glow
//         const glow = ctx!.createRadialGradient(n.px, n.py, 0, n.px, n.py, r * 4);
//         glow.addColorStop(0, color + Math.floor(n.alpha * 120).toString(16).padStart(2, "0"));
//         glow.addColorStop(1, color + "00");
//         ctx!.beginPath();
//         ctx!.arc(n.px, n.py, r * 4, 0, Math.PI * 2);
//         ctx!.fillStyle = glow;
//         ctx!.fill();
//         // Core dot
//         ctx!.beginPath();
//         ctx!.arc(n.px, n.py, r, 0, Math.PI * 2);
//         ctx!.fillStyle = color + Math.floor(n.alpha * 255).toString(16).padStart(2, "0");
//         ctx!.fill();
//       });

//       // Flowing data packets along some connections (every 60 frames pick new ones)
//       if (frame % 3 === 0) {
//         const t = (frame / 3) % 1;
//         for (let k = 0; k < 5; k++) {
//           const a = projected[k * 7 % projected.length];
//           const b = projected[(k * 7 + 3) % projected.length];
//           const px = a.px + (b.px - a.px) * ((t + k * 0.2) % 1);
//           const py = a.py + (b.py - a.py) * ((t + k * 0.2) % 1);
//           ctx!.beginPath();
//           ctx!.arc(px, py, 2.5, 0, Math.PI * 2);
//           ctx!.fillStyle = colors[k % 3] + "CC";
//           ctx!.fill();
//         }
//       }
//     }

//     draw();
//     return () => {
//       cancelAnimationFrame(animRef.current);
//       window.removeEventListener("resize", onResize);
//       window.removeEventListener("mousemove", onM);
//     };
//   }, []);

//   const parallaxX = mounted ? (mousePos.x - (typeof window !== "undefined" ? window.innerWidth : 1200) / 2) / 60 : 0;
//   const parallaxY = mounted ? (mousePos.y - (typeof window !== "undefined" ? window.innerHeight : 800) / 2) / 60 : 0;

//   return (
//     <div className="bg-[#060B18] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
//         @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
//         @keyframes glow { 0%,100% { box-shadow: 0 0 20px #2F6FED40; } 50% { box-shadow: 0 0 50px #2F6FED80, 0 0 80px #7C6AE840; } }
//         @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
//         @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
//         @keyframes spin3d { from { transform:rotateY(0deg) rotateX(15deg); } to { transform:rotateY(360deg) rotateX(15deg); } }
//         @keyframes borderPulse { 0%,100% { border-color:#2F6FED30; } 50% { border-color:#7C6AE860; } }
//         @keyframes scanline { 0% { top:-2px; } 100% { top:100%; } }
//         @keyframes countUp { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
//         .shimmer { background:linear-gradient(90deg,#fff 0%,#fff 20%,#7C6AE8 40%,#2F6FED 50%,#7C6AE8 60%,#fff 80%,#fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 5s linear infinite; }
//         .card-glow:hover { box-shadow:0 0 40px #2F6FED20, inset 0 0 30px #2F6FED08; border-color:#2F6FED40 !important; }
//         .btn-primary { animation: glow 3s ease infinite; }
//       `}</style>

//       {/* ── CANVAS BACKGROUND ── */}
//       <canvas ref={canvasRef} className="fixed inset-0 z-0" style={{ pointerEvents: "none" }} />

//       {/* ── NAV ── */}
//       <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between"
//         style={{ background: "linear-gradient(180deg, rgba(6,11,24,0.9) 0%, transparent 100%)", backdropFilter: "blur(20px)" }}>
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl flex items-center justify-center"
//             style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)", boxShadow: "0 0 20px #2F6FED60" }}>
//             <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//               <path d="M3 9h4M11 9h4M9 3v4M9 11v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
//               <circle cx="9" cy="9" r="2" fill="white"/>
//             </svg>
//           </div>
//           <span className="font-bold text-[18px]" style={{ fontFamily: "'Space Grotesk'" }}>CogniFlow</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Link href="/sign-in" className="text-[#8B93AC] hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all">
//             Sign in
//           </Link>
//           <Link href="/sign-up" className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105"
//             style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)" }}>
//             Get started free →
//           </Link>
//         </div>
//       </nav>

//       {/* ── HERO ── */}
//       <section className="relative min-h-screen flex flex-col items-center justify-center px-6 z-10">

//         {/* Big glowing orb behind text */}
//         <div className="absolute pointer-events-none" style={{
//           width: 800, height: 800, borderRadius: "50%",
//           background: "radial-gradient(circle, #2F6FED10 0%, #7C6AE808 40%, transparent 70%)",
//           top: "50%", left: "50%", transform: "translate(-50%,-50%)",
//         }} />

//         {/* 3D floating pipeline diagram — parallax */}
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
//           style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)`, transition: "transform 0.15s ease-out" }}>
//           <svg width="900" height="300" viewBox="0 0 900 300" opacity="0.5">
//             <defs>
//               <filter id="glow-blue"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
//               <filter id="glow-purple"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
//               <marker id="arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
//                 <polygon points="0 0, 6 2, 0 4" fill="#2F6FED" opacity="0.6"/>
//               </marker>
//             </defs>

//             {/* Wires */}
//             <path d="M 175 150 C 250 150 280 150 320 150" stroke="#2F6FED" strokeWidth="1.5" fill="none" opacity="0.5" markerEnd="url(#arrow)" strokeDasharray="5 3">
//               <animate attributeName="stroke-dashoffset" values="0;-16" dur="1s" repeatCount="indefinite"/>
//             </path>
//             <path d="M 520 150 C 580 150 610 150 650 150" stroke="#7C6AE8" strokeWidth="1.5" fill="none" opacity="0.5" markerEnd="url(#arrow)" strokeDasharray="5 3">
//               <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.2s" repeatCount="indefinite"/>
//             </path>
//             <path d="M 420 175 C 420 210 420 220 420 240" stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="4 3">
//               <animate attributeName="stroke-dashoffset" values="0;-14" dur="0.8s" repeatCount="indefinite"/>
//             </path>
//             <path d="M 750 150 C 800 150 820 150 830 150" stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="5 3">
//               <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.5s" repeatCount="indefinite"/>
//             </path>

//             {/* Flowing data packets */}
//             <circle r="4" fill="#3B82F6" opacity="0.9" filter="url(#glow-blue)">
//               <animateMotion dur="2s" repeatCount="indefinite" path="M 175 150 C 250 150 280 150 320 150"/>
//             </circle>
//             <circle r="3.5" fill="#7C6AE8" opacity="0.9" filter="url(#glow-purple)">
//               <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M 520 150 C 580 150 610 150 650 150"/>
//             </circle>
//             <circle r="3" fill="#10B981" opacity="0.9">
//               <animateMotion dur="1.8s" repeatCount="indefinite" begin="1s" path="M 420 175 C 420 210 420 220 420 240"/>
//             </circle>

//             {/* Source node */}
//             <g filter="url(#glow-blue)">
//               <rect x="60" y="120" width="115" height="60" rx="12" fill="#0B1629" stroke="#3B82F6" strokeWidth="1.5"/>
//               <circle cx="85" cy="145" r="6" fill="#3B82F6"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/></circle>
//               <text x="98" y="149" fill="white" fontSize="12" fontFamily="monospace" fontWeight="600">employees</text>
//               <text x="85" y="166" fill="#3B82F6" fontSize="9" fontFamily="monospace">.csv · 12 rows</text>
//             </g>

//             {/* Transform 1 */}
//             <g filter="url(#glow-purple)">
//               <rect x="320" y="115" width="100" height="70" rx="12" fill="#0B1629" stroke="#7C6AE8" strokeWidth="1.5"/>
//               <circle cx="340" cy="143" r="5" fill="#7C6AE8"><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.3s"/></circle>
//               <text x="352" y="147" fill="white" fontSize="11" fontFamily="monospace" fontWeight="600">AI Clean</text>
//               <text x="340" y="163" fill="#7C6AE8" fontSize="9" fontFamily="monospace">−3 nulls</text>
//               <text x="340" y="175" fill="#7C6AE8" fontSize="9" fontFamily="monospace">−3 dupes</text>
//             </g>

//             {/* Transform 2 (SCD) */}
//             <g>
//               <rect x="370" y="240" width="100" height="50" rx="10" fill="#0B1629" stroke="#7C6AE8" strokeWidth="1" opacity="0.7"/>
//               <text x="385" y="262" fill="white" fontSize="10" fontFamily="monospace">SCD Type 2</text>
//               <text x="385" y="277" fill="#7C6AE8" fontSize="8" fontFamily="monospace">history tracked</text>
//             </g>

//             {/* Transform 3 */}
//             <g>
//               <rect x="650" y="120" width="100" height="60" rx="12" fill="#0B1629" stroke="#7C6AE8" strokeWidth="1.5"/>
//               <circle cx="668" cy="147" r="5" fill="#7C6AE8"/>
//               <text x="680" y="151" fill="white" fontSize="11" fontFamily="monospace" fontWeight="600">Sorter</text>
//               <text x="668" y="167" fill="#7C6AE8" fontSize="9" fontFamily="monospace">by salary ↓</text>
//             </g>

//             {/* Target */}
//             <g filter="url(#glow-blue)">
//               <rect x="835" y="122" width="55" height="56" rx="10" fill="#0B1629" stroke="#10B981" strokeWidth="1.5"/>
//               <circle cx="855" cy="148" r="5" fill="#10B981"><animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite"/></circle>
//               <text x="848" y="163" fill="#10B981" fontSize="8" fontFamily="monospace">PG DB</text>
//             </g>

//             {/* Step count badge */}
//             <text x="450" y="50" fill="#5B6480" fontSize="11" fontFamily="monospace" textAnchor="middle">9 rows · 4 steps · 341ms ✓</text>
//           </svg>
//         </div>

//         {/* Hero text */}
//         <div className="relative z-10 text-center max-w-4xl" style={{ animation: "fadeUp 0.8s ease 0.2s both" }}>
//           <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
//             style={{ background: "#0F1A30", border: "1px solid #2F6FED30", animation: "borderPulse 4s ease infinite" }}>
//             <span className="w-2 h-2 rounded-full bg-[#10B981]" style={{ animation: "float 2s ease infinite" }} />
//             <span className="text-[#8B93AC] text-sm">Enterprise ETL · Built for data engineers</span>
//           </div>

//           <h1 className="mb-6 tracking-tight leading-[1.06]" style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 700 }}>
//             <span className="text-white">Pipeline design</span>
//             <br />
//             <span className="shimmer">the way IICS should work</span>
//           </h1>

//           <p className="text-[#8B93AC] mb-10 mx-auto leading-relaxed"
//             style={{ fontSize: "clamp(15px, 2vw, 19px)", maxWidth: 600 }}>
//             Visual pipeline designer with SCD 1/2/3, AI-powered data cleaning,
//             environment promotion, and real-time execution — without the Informatica price tag.
//           </p>

//           <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
//             <Link href="/sign-up"
//               className="btn-primary group relative overflow-hidden flex items-center gap-3 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:scale-105 text-base"
//               style={{ background: "linear-gradient(135deg, #2F6FED 0%, #7C6AE8 100%)" }}>
//               <span>Start building free</span>
//               <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="group-hover:translate-x-1 transition-transform">
//                 <path d="M3.5 9h11M10 5l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </Link>
//             <Link href="/sign-in"
//               className="text-[#8B93AC] hover:text-white font-medium px-6 py-4 rounded-2xl border transition-all text-base hover:border-[#2F6FED60]"
//               style={{ borderColor: "#1A2740" }}>
//               Sign in to dashboard
//             </Link>
//           </div>

//           <div className="flex items-center justify-center gap-8 text-[13px] text-[#3A4558] flex-wrap">
//             {["No credit card required", "Visual-first, code-optional", "DEV → SIT → PROD built-in"].map((t, i) => (
//               <span key={i} className="flex items-center gap-1.5">
//                 <svg width="12" height="12" viewBox="0 0 12 12">
//                   <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
//                 </svg>
//                 {t}
//               </span>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── STATS ── */}
//       <section className="relative z-10 py-16 border-y" style={{ borderColor: "#1A2740", background: "rgba(6,11,24,0.8)", backdropFilter: "blur(20px)" }}>
//         <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-6">
//           {[
//             { num: "22+", label: "Enterprise transforms", sub: "Filter, SCD, Expression, Joiner..." },
//             { num: "3", label: "SCD types", sub: "Type 1, 2 & 3 out of the box" },
//             { num: "3", label: "Environments", sub: "DEV → SIT → PROD with visual diff" },
//             { num: "∞", label: "Pipelines", sub: "Free to build and run" },
//           ].map((s, i) => (
//             <div key={i} className="text-center p-6 rounded-2xl border transition-all card-glow"
//               style={{ border: "1px solid #1A2740", background: "rgba(15,22,41,0.6)", animation: `countUp 0.5s ease ${i * 0.1}s both` }}>
//               <div className="text-4xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk'", background: "linear-gradient(135deg, #2F6FED, #7C6AE8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//                 {s.num}
//               </div>
//               <div className="text-white text-sm font-semibold mb-1">{s.label}</div>
//               <div className="text-[#5B6480] text-xs">{s.sub}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── FEATURES ── */}
//       <section className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
//         <div className="text-center mb-16">
//           <h2 className="text-[42px] font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
//             Built for real data engineering
//           </h2>
//           <p className="text-[#8B93AC] text-lg">The transforms you need, the speed a modern tool should have.</p>
//         </div>

//         <div className="grid grid-cols-3 gap-4">
//           {[
//             { icon: "⇢", color: "#2F6FED", title: "Visual pipeline designer", desc: "Draw wires between nodes like Informatica IICS — but faster to learn, free to use, and built for modern data teams.", tag: "Core" },
//             { icon: "✦", color: "#7C6AE8", title: "AI data cleaning", desc: "Profile any CSV. AI detects nulls, duplicates, and format issues — then adds the right transforms with one click.", tag: "AI" },
//             { icon: "⊕", color: "#10B981", title: "SCD Type 1, 2 & 3", desc: "Full slowly-changing dimension support. Two-source pattern, snapshot comparison, surrogate key generation.", tag: "Core" },
//             { icon: "↑", color: "#D98A1E", title: "Environment promotion", desc: "Build in DEV, review diff in SIT, ship to PROD. Visual side-by-side comparison of what changed.", tag: "Workflow" },
//             { icon: "◉", color: "#2F6FED", title: "Real-time run progress", desc: "Live step-by-step execution modal. Watch row counts flow through each transform as the pipeline runs.", tag: "Monitor" },
//             { icon: "⏱", color: "#7C6AE8", title: "Schedules & alerts", desc: "Cron schedules with timezone support. Email and Slack alerts on every scheduled run or failure.", tag: "Ops" },
//           ].map((f, i) => (
//             <div key={i}
//               className="card-glow relative group rounded-2xl p-6 border transition-all duration-300 cursor-default"
//               style={{ border: "1px solid #1A2740", background: "linear-gradient(135deg, #0B1220 0%, #0D1627 100%)", animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
//               <div className="flex items-start justify-between mb-4">
//                 <div className="text-3xl" style={{ color: f.color }}>{f.icon}</div>
//                 <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color: f.color, background: f.color + "15", border: `1px solid ${f.color}30` }}>{f.tag}</span>
//               </div>
//               <h3 className="text-white font-semibold text-[15px] mb-2">{f.title}</h3>
//               <p className="text-[#5B6480] text-[13px] leading-relaxed">{f.desc}</p>
//               {/* Bottom accent line */}
//               <div className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)` }} />
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── TERMINAL DEMO ── */}
//       <section className="relative z-10 py-20 px-6" style={{ background: "rgba(6,11,24,0.9)" }}>
//         <div className="max-w-3xl mx-auto">
//           <div className="text-center mb-10">
//             <h2 className="text-[36px] font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>See a pipeline run</h2>
//             <p className="text-[#8B93AC]">Real output from CogniFlow running on <code className="font-mono text-[#2F6FED] text-sm">employees_dirty.csv</code></p>
//           </div>

//           <div className="rounded-2xl overflow-hidden border border-[#1A2740]" style={{ boxShadow: "0 0 60px #2F6FED12, 0 0 120px #7C6AE808" }}>
//             {/* Window chrome */}
//             <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1A2740]" style={{ background: "#080E1C" }}>
//               <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
//               <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
//               <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
//               <div className="flex-1 mx-4">
//                 <div className="mx-auto w-fit px-3 py-1 rounded-md text-[11px] font-mono text-[#5B6480]" style={{ background: "#0D1627" }}>
//                   CogniFlow · pipeline run · employees_dirty.csv
//                 </div>
//               </div>
//             </div>
//             {/* Content */}
//             <div className="p-6" style={{ background: "#06080F" }}>
//               <div className="font-mono text-[12px] space-y-2.5">
//                 {[
//                   { t: 0.0, ok: true,  icon: "▶", color: "#5B6480", text: "Running pipeline — employees_dirty.csv" },
//                   { t: 0.4, ok: true,  icon: "✓", color: "#3B82F6", text: "Source           12 rows loaded · 8 columns detected" },
//                   { t: 0.9, ok: true,  icon: "✓", color: "#7C6AE8", text: "AI Clean         3 nulls filled · 2 case issues fixed" },
//                   { t: 1.4, ok: true,  icon: "✓", color: "#7C6AE8", text: "Deduplicate      3 duplicate rows removed → 9 rows" },
//                   { t: 1.9, ok: true,  icon: "✓", color: "#7C6AE8", text: "Sorter           sorted by Salary descending" },
//                   { t: 2.4, ok: true,  icon: "✓", color: "#10B981", text: "Target           9 rows written to postgres.employees_clean" },
//                   { t: 2.9, ok: true,  icon: "◉", color: "#10B981", text: "Done             9 rows · 4 steps · 341ms" },
//                 ].map((l, i) => (
//                   <div key={i} className="flex items-center gap-3" style={{ animation: `fadeUp 0.3s ease ${l.t + 0.5}s both`, opacity: 0 }}>
//                     <span style={{ color: l.color, width: 16 }}>{l.icon}</span>
//                     <span style={{ color: l.color + "99", width: 20, fontSize: 10 }}>{l.t.toFixed(1)}s</span>
//                     <span style={{ color: l.ok ? "#C4CBDC" : "#DA4B4B" }}>{l.text}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ── */}
//       <section className="relative z-10 py-28 px-6 text-center">
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//           <div style={{ width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, #2F6FED08 0%, transparent 70%)" }} />
//         </div>
//         <div className="relative max-w-2xl mx-auto">
//           <h2 className="text-[52px] font-bold mb-6 leading-tight" style={{ fontFamily: "'Space Grotesk'" }}>
//             Ship your first<br />pipeline today
//           </h2>
//           <p className="text-[#8B93AC] text-lg mb-10 leading-relaxed">
//             Free to start. No credit card. No vendor lock-in.<br />
//             Built by a data engineer, for data engineers.
//           </p>
//           <Link href="/sign-up"
//             className="btn-primary inline-flex items-center gap-3 text-white font-semibold text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105"
//             style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)" }}>
//             Start building free
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path d="M4 10h12M12 6l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//           </Link>
//         </div>
//       </section>

//       {/* ── FOOTER ── */}
//       <footer className="relative z-10 border-t py-8 px-8 flex items-center justify-between" style={{ borderColor: "#1A2740" }}>
//         <div className="flex items-center gap-2.5">
//           <div className="w-7 h-7 rounded-lg" style={{ background: "linear-gradient(135deg, #2F6FED, #7C6AE8)" }} />
//           <span className="font-bold text-[15px]" style={{ fontFamily: "'Space Grotesk'" }}>CogniFlow</span>
//         </div>
//         <div className="text-[#3A4558] text-sm">Data Engineering Platform · Built by Aryan</div>
//         <div className="flex items-center gap-6 text-[#3A4558] text-sm">
//           <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
//           <Link href="/sign-up" className="hover:text-white transition-colors">Get started</Link>
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";


const FAQS = [
  { q:"Do I need to know how to code?", a:"No. CogniFlow is designed for data engineers who understand data — not developers who write code. Every transform is configured visually. That said, the Expression transform lets you write formulas if you want that control." },
  { q:"How is this different from Informatica IICS?", a:"CogniFlow is free, runs in any browser, takes minutes to set up, and includes AI-powered transforms. Informatica costs tens of thousands of dollars per year and requires enterprise onboarding. The pipeline design experience is intentionally similar." },
  { q:"Can I connect to my own database?", a:"Yes — Postgres, MySQL, and Google Sheets are supported today. REST API connectors are also available. More database types are on the roadmap." },
  { q:"Is my data secure?", a:"Your CSV data is stored in MongoDB Atlas (Mumbai region). Pipeline definitions and run logs are stored server-side. Raw data from database connections is fetched at run-time and never persisted beyond the run." },
  { q:"Can I use this for a client project?", a:"Absolutely. The Pro plan includes team workspaces, so you can invite clients or collaborators. The Free plan is fine for solo projects and demos." },
];

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number|null>(null);
  return (
    <div>
      {FAQS.map((item, i) => (
        <div key={i} style={{ borderBottom:"1px solid #1A2740" }}>
          <button onClick={() => setOpenIdx(openIdx===i?null:i)} style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0",background:"none",border:"none",color:"white",fontSize:15,fontWeight:600,cursor:"pointer",textAlign:"left",gap:16 }}>
            <span>{item.q}</span>
            <span style={{ color:"#5B6480",fontSize:20,transform:openIdx===i?"rotate(45deg)":"none",transition:"transform 0.2s",flexShrink:0 }}>+</span>
          </button>
          {openIdx===i && <p style={{ color:"#8B93AC",fontSize:14,lineHeight:1.75,paddingBottom:20,margin:0 }}>{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

    const nodes: any[] = [];
    for (let i = 0; i < 70; i++) {
      nodes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * 800, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, vz: (Math.random()-0.5)*0.4, type: i%3, pulse: Math.random()*Math.PI*2 });
    }
    const colors = ["#3B82F6","#7C6AE8","#10B981"];
    let mx = canvas.width/2, my = canvas.height/2;
    window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

    function draw() {
      animRef.current = requestAnimationFrame(draw);
      ctx!.clearRect(0,0,canvas!.width,canvas!.height);
      const g = ctx!.createRadialGradient(canvas!.width/2,canvas!.height/2,0,canvas!.width/2,canvas!.height/2,canvas!.width);
      g.addColorStop(0,"#0A1020"); g.addColorStop(1,"#050810");
      ctx!.fillStyle = g; ctx!.fillRect(0,0,canvas!.width,canvas!.height);
      const mdx = (mx-canvas!.width/2)/canvas!.width, mdy = (my-canvas!.height/2)/canvas!.height;
      const proj = nodes.map(n => {
        n.x+=n.vx+mdx*0.08; n.y+=n.vy+mdy*0.08; n.z+=n.vz; n.pulse+=0.025;
        if(n.x<-50)n.x=canvas!.width+50; if(n.x>canvas!.width+50)n.x=-50;
        if(n.y<-50)n.y=canvas!.height+50; if(n.y>canvas!.height+50)n.y=-50;
        if(n.z<0)n.z=800; if(n.z>800)n.z=0;
        const s=700/(700+n.z), px=(n.x-canvas!.width/2)*s+canvas!.width/2, py=(n.y-canvas!.height/2)*s+canvas!.height/2;
        return { px,py,s,type:n.type,pulse:n.pulse };
      });
      proj.forEach((a,i) => {
        proj.slice(i+1).forEach(b => {
          const d=Math.hypot(a.px-b.px,a.py-b.py);
          if(d<100) { ctx!.beginPath(); ctx!.moveTo(a.px,a.py); ctx!.lineTo(b.px,b.py); ctx!.strokeStyle=colors[a.type]+Math.floor((1-d/100)*30).toString(16).padStart(2,"0"); ctx!.lineWidth=0.4; ctx!.stroke(); }
        });
        const r=Math.max(0.5,(1+Math.sin(a.pulse)*0.4))*a.s*3;
        const gl=ctx!.createRadialGradient(a.px,a.py,0,a.px,a.py,r*5);
        gl.addColorStop(0,colors[a.type]+"60"); gl.addColorStop(1,colors[a.type]+"00");
        ctx!.beginPath(); ctx!.arc(a.px,a.py,r*5,0,Math.PI*2); ctx!.fillStyle=gl; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(a.px,a.py,r,0,Math.PI*2); ctx!.fillStyle=colors[a.type]+"CC"; ctx!.fill();
      });
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const px = mounted ? (mousePos.x - window.innerWidth / 2) / 70 : 0;
  const py = mounted ? (mousePos.y - window.innerHeight / 2) / 70 : 0;

  return (
    <div style={{ background:"#050810", color:"white", fontFamily:"'Inter',sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #2F6FED40}50%{box-shadow:0 0 50px #2F6FED70,0 0 80px #7C6AE830}}
        @keyframes flow{to{stroke-dashoffset:-20}}
        @keyframes borderGlow{0%,100%{border-color:#1A2740}50%{border-color:#2F6FED40}}
        .shimmer{background:linear-gradient(90deg,#fff 0%,#fff 25%,#7C6AE8 45%,#2F6FED 55%,#7C6AE8 65%,#fff 80%,#fff 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 6s linear infinite}
        .card:hover{border-color:#2F6FED40!important;box-shadow:0 0 40px #2F6FED15,0 20px 60px rgba(0,0,0,0.3)!important;transform:translateY(-2px)}
        .btn-glow{animation:glow 3s ease infinite}
        .wire{stroke-dasharray:6 4;animation:flow 1.5s linear infinite}
      `}</style>

      <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }} />

      {/* NAV */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(5,8,16,0.85)",backdropFilter:"blur(24px)",borderBottom:"1px solid #0F1A30" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2F6FED,#7C6AE8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px #2F6FED50" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="4" cy="9" r="3" stroke="white" strokeWidth="1.5"/><circle cx="14" cy="9" r="3" stroke="white" strokeWidth="1.5"/><path d="M7 9h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontFamily:"'Space Grotesk'",fontWeight:700,fontSize:18 }}>CogniFlow</span>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <Link href="#features" style={{ color:"#8B93AC",textDecoration:"none",fontSize:14,fontWeight:500,padding:"8px 16px" }}>Features</Link>
          <Link href="#pricing" style={{ color:"#8B93AC",textDecoration:"none",fontSize:14,fontWeight:500,padding:"8px 16px" }}>Pricing</Link>
          <Link href="/sign-in" style={{ color:"#8B93AC",textDecoration:"none",fontSize:14,fontWeight:500,padding:"8px 16px",borderRadius:10,border:"1px solid #1A2740" }}>Sign in</Link>
          <Link href="/sign-up" className="btn-glow" style={{ color:"white",textDecoration:"none",fontSize:14,fontWeight:600,padding:"10px 20px",borderRadius:12,background:"linear-gradient(135deg,#2F6FED,#7C6AE8)" }}>
            Get started free →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:"relative",zIndex:10,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",textAlign:"center" }}>
        <div style={{ position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,#2F6FED0A 0%,transparent 70%)",pointerEvents:"none" }} />

        {/* Parallax pipeline */}
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",transform:mounted?`translate(${px}px,${py}px)`:"none",transition:"transform 0.1s ease-out" }}>
          <svg width="860" height="260" viewBox="0 0 860 260" style={{ opacity:0.45 }}>
            <defs>
              <filter id="b1"><feGaussianBlur stdDeviation="3"/></filter>
              <marker id="arr" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0,5 2,0 4" fill="#2F6FED" opacity="0.7"/></marker>
              <marker id="arr2" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0,5 2,0 4" fill="#7C6AE8" opacity="0.7"/></marker>
            </defs>
            <path d="M155 130 C200 130 220 130 255 130" stroke="#2F6FED" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" className="wire"/>
            <path d="M405 130 C450 130 470 130 505 130" stroke="#7C6AE8" strokeWidth="1.5" fill="none" markerEnd="url(#arr2)" className="wire"/>
            <path d="M655 130 C700 130 720 130 750 130" stroke="#10B981" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" className="wire"/>
            <path d="M330 152 C330 185 330 195 330 210" stroke="#7C6AE8" strokeWidth="1.5" fill="none" className="wire"/>
            {/* Nodes */}
            <g><rect x="30" y="102" width="125" height="56" rx="12" fill="#0C1525" stroke="#3B82F6" strokeWidth="1.5"/><circle cx="55" cy="128" r="6" fill="#3B82F6"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle><text x="68" y="133" fill="white" fontSize="12" fontFamily="monospace" fontWeight="600">CSV Source</text><text x="55" y="149" fill="#3B82F6" fontSize="9" fontFamily="monospace">12 rows loaded</text></g>
            <g><rect x="255" y="97" width="150" height="66" rx="12" fill="#0C1525" stroke="#7C6AE8" strokeWidth="1.5"/><circle cx="278" cy="126" r="5" fill="#7C6AE8"><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.3s"/></circle><text x="290" y="130" fill="white" fontSize="12" fontFamily="monospace" fontWeight="600">AI Clean</text><text x="278" y="147" fill="#7C6AE8" fontSize="9" fontFamily="monospace">−3 nulls · −3 dupes</text><text x="278" y="157" fill="#7C6AE8" fontSize="9" fontFamily="monospace">→ 9 rows</text></g>
            <g><rect x="300" y="210" width="110" height="46" rx="10" fill="#0C1525" stroke="#7C6AE8" strokeWidth="1" opacity="0.8"/><text x="320" y="232" fill="white" fontSize="10" fontFamily="monospace">SCD Type 2</text><text x="320" y="246" fill="#7C6AE8" fontSize="8" fontFamily="monospace">history tracked</text></g>
            <g><rect x="505" y="102" width="150" height="56" rx="12" fill="#0C1525" stroke="#7C6AE8" strokeWidth="1.5"/><circle cx="528" cy="128" r="5" fill="#7C6AE8"/><text x="540" y="132" fill="white" fontSize="12" fontFamily="monospace" fontWeight="600">Expression</text><text x="528" y="148" fill="#7C6AE8" fontSize="9" fontFamily="monospace">salary * 1.1</text></g>
            <g><rect x="750" y="108" width="100" height="44" rx="10" fill="#0C1525" stroke="#10B981" strokeWidth="1.5"/><circle cx="770" cy="128" r="5" fill="#10B981"><animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite"/></circle><text x="782" y="132" fill="white" fontSize="11" fontFamily="monospace" fontWeight="600">Postgres</text></g>
            {/* Packets */}
            <circle r="4" fill="#3B82F6" filter="url(#b1)"><animateMotion dur="2s" repeatCount="indefinite" path="M155 130 C200 130 220 130 255 130"/></circle>
            <circle r="3.5" fill="#7C6AE8" filter="url(#b1)"><animateMotion dur="2.2s" repeatCount="indefinite" begin="0.5s" path="M405 130 C450 130 470 130 505 130"/></circle>
            <circle r="3" fill="#10B981"><animateMotion dur="2.5s" repeatCount="indefinite" begin="1s" path="M655 130 C700 130 720 130 750 130"/></circle>
            <text x="430" y="45" fill="#4B5563" fontSize="11" fontFamily="monospace" textAnchor="middle">✓ 9 rows · 4 steps · 341ms</text>
          </svg>
        </div>

        <div style={{ position:"relative",zIndex:10,maxWidth:820,animation:"fadeUp 0.7s ease 0.1s both" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:100,background:"#0F1A30",border:"1px solid #1A2740",marginBottom:28,animation:"borderGlow 4s ease infinite" }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:"#10B981",display:"inline-block",animation:"pulse 2s infinite" }} />
            <span style={{ color:"#8B93AC",fontSize:13 }}>Purpose-built for data engineers · Not another low-code toy</span>
          </div>

          <h1 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(42px,5.5vw,74px)",fontWeight:700,lineHeight:1.07,marginBottom:24,letterSpacing:"-0.02em" }}>
            <span style={{ color:"white" }}>The ETL platform</span><br/>
            <span className="shimmer">Informatica users deserve</span>
          </h1>

          <p style={{ color:"#8B93AC",fontSize:"clamp(15px,1.8vw,19px)",lineHeight:1.7,marginBottom:40,maxWidth:580,margin:"0 auto 40px" }}>
            Design pipelines visually. SCD 1, 2 & 3. AI-powered data cleaning.
            Environment promotion from DEV to PROD.
            Everything Informatica IICS does — at zero cost.
          </p>

          <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:32 }}>
            <Link href="/sign-up" className="btn-glow" style={{ display:"inline-flex",alignItems:"center",gap:10,color:"white",textDecoration:"none",fontWeight:700,fontSize:16,padding:"16px 36px",borderRadius:16,background:"linear-gradient(135deg,#2F6FED,#7C6AE8)" }}>
              Start free — no credit card
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.5 9h11M10 5l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/sign-in" style={{ display:"inline-flex",alignItems:"center",gap:8,color:"#8B93AC",textDecoration:"none",fontWeight:500,fontSize:15,padding:"16px 28px",borderRadius:16,border:"1px solid #1A2740",transition:"all 0.2s" }}>
              Sign in to dashboard →
            </Link>
          </div>

          <div style={{ display:"flex",gap:24,justifyContent:"center",fontSize:13,color:"#3A4558",flexWrap:"wrap" }}>
            {["Free forever plan", "Visual-first, code-optional", "DEV → SIT → PROD built-in", "AI transforms included"].map((t,i) => (
              <span key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div style={{ position:"relative",zIndex:10,padding:"20px 40px",borderTop:"1px solid #0F1A30",borderBottom:"1px solid #0F1A30",background:"rgba(10,16,32,0.8)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",gap:48,flexWrap:"wrap" }}>
        {[
          { num:"22+", label:"Transform types" },
          { num:"SCD 1,2,3", label:"All types supported" },
          { num:"<5min", label:"First pipeline live" },
          { num:"3 envs", label:"DEV → SIT → PROD" },
          { num:"AI", label:"Powered transforms" },
        ].map((s,i) => (
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Space Grotesk'",fontSize:22,fontWeight:700,background:"linear-gradient(135deg,#2F6FED,#7C6AE8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.num}</div>
            <div style={{ color:"#5B6480",fontSize:12,marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section style={{ position:"relative",zIndex:10,padding:"100px 24px",maxWidth:900,margin:"0 auto",textAlign:"center" }}>
        <p style={{ color:"#2F6FED",fontSize:12,fontWeight:600,letterSpacing:"0.15em",marginBottom:12 }}>HOW IT WORKS</p>
        <h2 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(32px,4vw,48px)",fontWeight:700,marginBottom:16 }}>Three steps to production</h2>
        <p style={{ color:"#8B93AC",fontSize:16,marginBottom:64 }}>No scripts. No YAML. No vendor onboarding calls.</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2 }}>
          {[
            { step:"01", title:"Connect your data", desc:"Upload a CSV or connect to Postgres, MySQL, Google Sheets, or any REST API. No driver config.", color:"#2F6FED" },
            { step:"02", title:"Design your pipeline", desc:"Drag transforms onto the canvas. Wire them up. Configure each step in the inspector panel on the right.", color:"#7C6AE8" },
            { step:"03", title:"Run and promote", desc:"Click Run. Preview output. Schedule it. Promote from DEV to SIT to PROD with a single button.", color:"#10B981" },
          ].map((s,i) => (
            <div key={i} className="card" style={{ padding:36,border:"1px solid #1A2740",background:"linear-gradient(135deg,#0B1220,#0D1830)",borderRadius:i===0?"16px 0 0 16px":i===2?"0 16px 16px 0":"0",transition:"all 0.3s",position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:20,right:20,fontFamily:"monospace",fontSize:48,fontWeight:700,color:s.color+"12",lineHeight:1 }}>{s.step}</div>
              <div style={{ width:48,height:48,borderRadius:14,background:s.color+"18",border:`1px solid ${s.color}30`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
                <span style={{ color:s.color,fontSize:22,fontWeight:700 }}>{s.step.replace("0","")}</span>
              </div>
              <h3 style={{ fontSize:17,fontWeight:700,marginBottom:10,textAlign:"left" }}>{s.title}</h3>
              <p style={{ color:"#8B93AC",fontSize:13.5,lineHeight:1.7,textAlign:"left" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position:"relative",zIndex:10,padding:"80px 24px",maxWidth:1100,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
          <p style={{ color:"#7C6AE8",fontSize:12,fontWeight:600,letterSpacing:"0.15em",marginBottom:12 }}>FEATURES</p>
          <h2 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(32px,4vw,48px)",fontWeight:700,marginBottom:16 }}>Built for real data engineering</h2>
          <p style={{ color:"#8B93AC",fontSize:16 }}>Not a drag-and-drop toy. A production-grade ETL tool.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>
          {[
            { icon:"⇢", color:"#2F6FED", title:"Visual pipeline designer", desc:"Node canvas with manual wiring, port dots, topological execution. Feels like IICS — works in your browser." },
            { icon:"✦", color:"#7C6AE8", title:"AI data cleaning", desc:"Upload any CSV. AI profiles your columns and suggests deduplicate, null-fill, and format transforms instantly." },
            { icon:"⊕", color:"#10B981", title:"SCD Type 1, 2 & 3", desc:"Full slowly-changing dimension support. Two-source pattern, snapshot diff, surrogate keys, EXPIRE rows." },
            { icon:"↑", color:"#D98A1E", title:"Environment promotion", desc:"DEV → SIT → PROD with visual diff. See exactly which nodes and configs changed between environments." },
            { icon:"◉", color:"#2F6FED", title:"Real-time execution", desc:"Live step-by-step progress modal. Row counts, duration, and status update as each transform runs." },
            { icon:"⏱", color:"#7C6AE8", title:"Schedules & alerts", desc:"Cron jobs with IST timezone. Email + Slack on failure or success. In-app notification bell." },
            { icon:"🔒", color:"#10B981", title:"Version history", desc:"Every save creates a snapshot. Browse 50 versions per pipeline. Restore any version with one click." },
            { icon:"⚡", color:"#D98A1E", title:"API trigger", desc:"Generate API keys and trigger any pipeline via POST request from external tools or CI/CD pipelines." },
            { icon:"⇄", color:"#2F6FED", title:"Column mapping", desc:"Drag source columns to target columns. Apply per-column transforms: uppercase, toNumber, toDate, trim." },
          ].map((f,i) => (
            <div key={i} className="card" style={{ padding:28,border:"1px solid #1A2740",background:"linear-gradient(135deg,#0B1220,#0D1830)",borderRadius:16,transition:"all 0.3s",cursor:"default" }}>
              <div style={{ fontSize:28,marginBottom:16,color:f.color }}>{f.icon}</div>
              <h3 style={{ fontSize:15,fontWeight:700,marginBottom:8 }}>{f.title}</h3>
              <p style={{ color:"#5B6480",fontSize:13,lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VS COMPARISON */}
      <section style={{ position:"relative",zIndex:10,padding:"80px 24px",maxWidth:900,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(28px,3.5vw,42px)",fontWeight:700,marginBottom:12 }}>CogniFlow vs the alternatives</h2>
          <p style={{ color:"#8B93AC",fontSize:15 }}>Why pay enterprise prices for enterprise complexity?</p>
        </div>
        <div style={{ border:"1px solid #1A2740",borderRadius:20,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",background:"#0B1220",padding:"16px 24px",gap:8 }}>
            {["Feature","CogniFlow","Informatica","dbt"].map((h,i) => (
              <div key={i} style={{ fontSize:12,fontWeight:600,color:i===0?"#5B6480":i===1?"#2F6FED":"#3A4558",textAlign:i===0?"left":"center" }}>{h}</div>
            ))}
          </div>
          {[
            ["Visual pipeline designer","✓","✓","✗"],
            ["SCD Type 1, 2, 3","✓","✓","✗"],
            ["AI-powered transforms","✓","✗","✗"],
            ["Free tier","✓","✗","✓"],
            ["Real-time run progress","✓","✗","✗"],
            ["In-app scheduling","✓","✓","✗"],
            ["No-code setup","✓","✗","✗"],
            ["Pipeline sharing","✓","✗","✗"],
          ].map((row,i) => (
            <div key={i} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"14px 24px",gap:8,borderTop:"1px solid #0F1A30",background:i%2===0?"transparent":"#0A1020" }}>
              <div style={{ fontSize:13.5,color:"#C4CBDC" }}>{row[0]}</div>
              {row.slice(1).map((v,j) => (
                <div key={j} style={{ textAlign:"center",fontSize:16,color:v==="✓"?(j===0?"#10B981":"#5B6480"):"#2A3552" }}>{v}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ position:"relative",zIndex:10,padding:"80px 24px",maxWidth:1000,margin:"0 auto",textAlign:"center" }}>
        <p style={{ color:"#2F6FED",fontSize:12,fontWeight:600,letterSpacing:"0.15em",marginBottom:12 }}>PRICING</p>
        <h2 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(32px,4vw,48px)",fontWeight:700,marginBottom:12 }}>Simple, honest pricing</h2>
        <p style={{ color:"#8B93AC",fontSize:16,marginBottom:56 }}>Start free. Scale when you're ready.</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
          {[
            { name:"Free", price:"₹0", period:"forever", color:"#2F6FED", features:["Unlimited pipelines","22+ transforms","AI data cleaning","Email alerts","Pipeline sharing","5 schedules","Community support"], cta:"Get started", href:"/sign-up", highlight:false },
            { name:"Pro", price:"₹2,499", period:"/month", color:"#7C6AE8", features:["Everything in Free","Unlimited schedules","Priority email support","Version history (100)","Custom webhook triggers","API key management","Team workspace"], cta:"Start free trial", href:"/sign-up", highlight:true },
            { name:"Enterprise", price:"Custom", period:"", color:"#10B981", features:["Everything in Pro","Dedicated instance","SLA guarantee","SSO / SAML","Custom transforms","On-premise deployment","Dedicated support"], cta:"Contact us", href:"mailto:aryanhedaoo2003@gmail.com", highlight:false },
          ].map((p,i) => (
            <div key={i} className="card" style={{ padding:32,border:`1px solid ${p.highlight?"#7C6AE840":"#1A2740"}`,background:p.highlight?"linear-gradient(135deg,#110E1F,#0E1530)":"linear-gradient(135deg,#0B1220,#0D1830)",borderRadius:20,position:"relative",transition:"all 0.3s",boxShadow:p.highlight?"0 0 40px #7C6AE820":undefined }}>
              {p.highlight && <div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#7C6AE8,#2F6FED)",color:"white",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:20 }}>MOST POPULAR</div>}
              <div style={{ fontSize:14,fontWeight:600,color:p.color,marginBottom:8 }}>{p.name}</div>
              <div style={{ fontFamily:"'Space Grotesk'",fontSize:36,fontWeight:700,marginBottom:4 }}>{p.price}</div>
              <div style={{ color:"#5B6480",fontSize:13,marginBottom:28 }}>{p.period}</div>
              <ul style={{ listStyle:"none",padding:0,margin:"0 0 28px",textAlign:"left" }}>
                {p.features.map((f,j) => (
                  <li key={j} style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:10,fontSize:13.5,color:"#C4CBDC" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink:0,marginTop:1 }}><circle cx="8" cy="8" r="7" fill={p.color+"20"}/><path d="M5 8l2 2 4-4" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} style={{ display:"block",textAlign:"center",padding:"12px 24px",borderRadius:12,background:p.highlight?"linear-gradient(135deg,#7C6AE8,#2F6FED)":"transparent",border:p.highlight?"none":`1px solid ${p.color}40`,color:p.highlight?"white":p.color,fontWeight:600,fontSize:14,textDecoration:"none",transition:"all 0.2s" }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position:"relative",zIndex:10,padding:"80px 24px",maxWidth:700,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(28px,3.5vw,42px)",fontWeight:700,marginBottom:12 }}>Common questions</h2>
        </div>
        <FaqSection />
    </section>
      {/* FINAL CTA */}
      <section style={{ position:"relative",zIndex:10,padding:"100px 24px",textAlign:"center" }}>
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
          <div style={{ width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,#2F6FED08 0%,transparent 70%)" }} />
        </div>
        <div style={{ position:"relative",maxWidth:640,margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Space Grotesk'",fontSize:"clamp(36px,5vw,60px)",fontWeight:700,lineHeight:1.1,marginBottom:20 }}>
            Ship your first pipeline<br/>in under 5 minutes
          </h2>
          <p style={{ color:"#8B93AC",fontSize:17,lineHeight:1.7,marginBottom:40 }}>
            Free forever. No credit card. No setup call.<br/>
            Built by a data engineer who got tired of Informatica's price tag.
          </p>
          <Link href="/sign-up" className="btn-glow" style={{ display:"inline-flex",alignItems:"center",gap:12,color:"white",textDecoration:"none",fontWeight:700,fontSize:17,padding:"18px 44px",borderRadius:18,background:"linear-gradient(135deg,#2F6FED,#7C6AE8)" }}>
            Get started free
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div style={{ marginTop:20,color:"#3A4558",fontSize:13 }}>
            Already have an account? <Link href="/sign-in" style={{ color:"#2F6FED",textDecoration:"none" }}>Sign in →</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position:"relative",zIndex:10,borderTop:"1px solid #0F1A30",padding:"32px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#2F6FED,#7C6AE8)" }} />
          <span style={{ fontFamily:"'Space Grotesk'",fontWeight:700,fontSize:16 }}>CogniFlow</span>
          <span style={{ color:"#3A4558",fontSize:13 }}>· Data Engineering Platform</span>
        </div>
        <div style={{ color:"#3A4558",fontSize:13 }}>Built by Aryan Hedaoo · Pune, India</div>
        <div style={{ display:"flex",gap:20 }}>
          <Link href="/sign-in" style={{ color:"#3A4558",textDecoration:"none",fontSize:13 }}>Sign in</Link>
          <Link href="/sign-up" style={{ color:"#3A4558",textDecoration:"none",fontSize:13 }}>Get started</Link>
          <a href="mailto:aryanhedaoo2003@gmail.com" style={{ color:"#3A4558",textDecoration:"none",fontSize:13 }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}