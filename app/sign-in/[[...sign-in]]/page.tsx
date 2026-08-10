import { SignIn } from "@clerk/nextjs";
import AuthBackground from "@/components/AuthBackground";
import { clerkAppearancePage } from "@/lib/clerkAppearance";

export default function Page() {
  return (
    <AuthBackground title="Welcome back" subtitle="Sign in to pick up where you left off.">
      <SignIn appearance={clerkAppearancePage} />
    </AuthBackground>
  );
}