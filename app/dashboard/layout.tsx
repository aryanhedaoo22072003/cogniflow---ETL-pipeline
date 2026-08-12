import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Home, Workflow, Activity, Plug, ListTree, Clock3, BellRing } from "lucide-react";
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

const orgSwitcherAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#8B7FFF",
    colorBackground: "#161829",
    colorInputBackground: "#0E0F1A",
    colorText: "#FFFFFF",
    colorTextSecondary: "#FFFFFF",
    borderRadius: "0.65rem",
    fontSize: "13px",
  },
  elements: {
    rootBox: "w-full",
    organizationSwitcherTrigger:
      "w-full flex items-center gap-2 bg-[#1B2740] border border-[#2A3752] rounded-lg px-2.5 py-2 hover:bg-[#212D4C] hover:border-[#3A4A78] transition-colors justify-between text-white",
    organizationSwitcherTriggerIcon: "text-white w-3.5 h-3.5",
    organizationPreviewMainIdentifier: "text-white text-[13px] font-semibold",
    organizationPreviewSecondaryIdentifier: "text-white  text-[11px] font-medium",
    organizationPreviewAvatarBox: "w-7 h-7 rounded-md",
    organizationPreviewTextContainer: "gap-0.5",
    organizationSwitcherPopoverCard:
      "bg-[#161829] border border-[#2A2E4A] shadow-2xl shadow-black/60 rounded-xl mt-2 w-[280px]",
    organizationSwitcherPopoverMain: "p-2",
    organizationSwitcherPreviewButton: "rounded-lg hover:bg-[#1F2740] px-2.5 py-2.5 w-full text-white",
    organizationSwitcherPopoverActionButton:
      "rounded-lg hover:bg-[#1F2740] px-2.5 py-2.5 text-white text-[13px] font-medium w-full",
    organizationSwitcherPopoverActionButtonIcon: "text-white w-4 h-4",
    organizationSwitcherPopoverActionButtonText: "text-white",
    organizationSwitcherPopoverFooter: "border-t border-[#2A2E4A] px-2 py-2",
    membershipBadge: "bg-[#8B7FFF33] text-white text-[10px] rounded-full px-2 py-0.5 font-medium",
    organizationSwitcherPopoverInvitationActionsBox: "px-2",
  },
};

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

        <div className="mb-3 px-1">
          <div className="text-[9.5px] uppercase tracking-wide text-[#5B6480] mb-1.5 px-1">Workspace</div>
          <OrganizationSwitcher
            appearance={orgSwitcherAppearance}
            hidePersonal={false}
            afterSelectOrganizationUrl="/dashboard"
            afterSelectPersonalUrl="/dashboard"
            createOrganizationMode="modal"
            organizationProfileMode="modal"
          />
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
        <div className="mt-auto flex items-center gap-2.5 pt-3 border-t border-[#22304F] px-2.5">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-6 h-6" },
            }}
          />
          <span className="text-[11px] text-[#5B6480]">v0.5 · signed in</span>
        </div>
      </div>
      <div className="overflow-hidden flex flex-col">
        <DbStatusBanner />
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}