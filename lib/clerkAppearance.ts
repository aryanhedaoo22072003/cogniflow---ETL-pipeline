import { dark } from "@clerk/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#8B7FFF",
    colorBackground: "#161829",
    colorInputBackground: "#0E0F1A",
    colorInputText: "#EAEBF5",
    colorText: "#EAEBF5",
    colorTextSecondary: "#8B8FB0",
    colorDanger: "#F26666",
    borderRadius: "0.85rem",
    fontFamily: "'Inter', sans-serif",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-[#161829] border border-[#2A2E4A] shadow-2xl shadow-black/50 rounded-2xl px-8 py-9",
    headerTitle: "text-white font-semibold",
    headerSubtitle: "text-[#8B8FB0]",
    socialButtonsBlockButton: "border border-[#2A2E4A] bg-[#1B2740] hover:bg-[#232748] text-[#EAEBF5] rounded-lg transition-colors",
    socialButtonsBlockButtonText: "font-medium text-[13.5px]",
    dividerRow: "my-5",
    dividerLine: "bg-[#2A2E4A]",
    dividerText: "text-[#8B8FB0] text-[11px] uppercase tracking-wide",
    formFieldLabel: "text-[#C4CBDC] text-[12.5px] font-medium",
    formFieldInput: "bg-[#0E0F1A] border border-[#2A2E4A] text-[#EAEBF5] rounded-lg focus:border-[#8B7FFF] focus:ring-1 focus:ring-[#8B7FFF33]",
    formFieldInputShowPasswordButton: "text-[#8B8FB0] hover:text-[#C4CBDC]",
    formButtonPrimary:
      "bg-gradient-to-r from-[#8B7FFF] to-[#5B9CF6] hover:opacity-90 text-[#12102A] font-semibold rounded-lg normal-case text-[13.5px] shadow-md shadow-[#8B7FFF22] transition-opacity",
    footerActionText: "text-[#8B8FB0] text-[13px]",
    footerActionLink: "text-[#8B7FFF] hover:text-[#A196FF] font-semibold",
    identityPreviewText: "text-[#EAEBF5]",
    identityPreviewEditButton: "text-[#8B7FFF] hover:text-[#A196FF]",
    otpCodeFieldInput: "bg-[#0E0F1A] border border-[#2A2E4A] text-white rounded-lg",
    formResendCodeLink: "text-[#8B7FFF] hover:text-[#A196FF]",
    alertText: "text-[13px]",
    formFieldAction: "text-[#8B7FFF] hover:text-[#A196FF] text-[12px]",
  },
};

// Used on the dedicated /sign-in and /sign-up pages, which render their own
// heading above the widget (see AuthBackground) — Clerk's default header
// would just duplicate that, so it's hidden here specifically.
export const clerkAppearancePage = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    header: "hidden",
  },
};