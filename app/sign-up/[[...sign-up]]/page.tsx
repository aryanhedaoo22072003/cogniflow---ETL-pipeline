import { SignUp } from "@clerk/nextjs";
import AuthBackground from "@/components/AuthBackground";
import { clerkAppearancePage } from "@/lib/clerkAppearance";

export default function Page() {
  return (
    <AuthBackground title="Create your account" subtitle="Build your first pipeline in a few minutes — free.">
      <SignUp appearance={clerkAppearancePage} />
    </AuthBackground>
  );
}