import Link from "next/link";
import { Home, Workflow, Activity, Plug, ListTree, Clock3,BellRing } from "lucide-react";
import DbStatusBanner from "@/components/DbStatusBanner";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/pipelines", label: "Data Integration", icon: Workflow },
  { href: "/dashboard/taskflows", label: "Taskflows", icon: ListTree },
  { href: "/dashboard/schedules", label: "Schedules", icon: Clock3 },
  { href: "/dashboard/monitor", label: "Monitor", icon: Activity },
  { href: "/dashboard/connections", label: "Connections", icon: Plug },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellRing },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr] h-screen bg-[#F4F6FA] text-[#1A2233]">
      <div className="bg-[#111A2E] text-[#C4CBDC] p-3 flex flex-col">
        <div className="flex items-center gap-2 px-2 pb-5 pt-2">
          <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-[#2F6FED] to-[#7C6AE8]" />
          <span className="text-white font-semibold text-[15px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CogniFlow
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <select className="flex-1 bg-[#1B2740] border border-[#2A3752] text-[#C4CBDC] text-[11.5px] font-mono px-2.5 py-1.5 rounded-md">
            <option>DEV</option>
            <option>SIT</option>
            <option>PROD</option>
          </select>
        </div>
        <nav className="space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium hover:bg-[#1B2740] hover:text-white transition-colors"
              >
                <Icon size={15} className="opacity-90" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-[11px] text-[#5B6480] pt-3 border-t border-[#22304F] px-2.5">
          v0.3 · Aryan Hedaoo
        </div>
      </div>
      <div className="overflow-hidden flex flex-col">
        <DbStatusBanner />
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}