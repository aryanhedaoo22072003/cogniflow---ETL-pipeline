import { SignIn } from "@clerk/nextjs";
import AuthBackground from "@/components/AuthBackground";

export default function Page() {
  return (
    <AuthBackground>
      <SignIn
        appearance={{
          variables: { colorPrimary: "#8B7FFF", borderRadius: "0.9rem" },
          elements: {
            card: "shadow-2xl shadow-black/40 border border-[#2A2E4A]",
            headerTitle: "font-semibold",
          },
        }}
      />
    </AuthBackground>
  );
}