// import PayButton from "@/components/PayButton";

// const plans = [
//   { id: "pro", name: "Pro", price: "₹300", desc: "For individual data engineers" },
//   { id: "team", name: "Team", price: "₹600", desc: "For groups and small teams" },
// ];

// export default function PricingPage() {
//   return (
//     <main className="mx-auto max-w-3xl px-6 py-16">
//       <h1 className="text-3xl font-semibold mb-2">Pricing</h1>
//       <p className="text-gray-500 mb-8">
//         7-day free trial, then pick a plan to keep using Cogniflow.
//       </p>
//       <div className="grid gap-6 sm:grid-cols-2">
//         {plans.map((p) => (
//           <div key={p.id} className="rounded-xl border p-6">
//             <h2 className="text-xl font-medium">{p.name}</h2>
//             <p className="text-3xl font-semibold my-3">
//               {p.price}
//               <span className="text-base font-normal text-gray-500"> / month</span>
//             </p>
//             <p className="text-sm text-gray-500 mb-5">{p.desc}</p>
//             <PayButton planId={p.id} label={`Upgrade to ${p.name}`} />
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }


import Link from "next/link";
import PayButton from "@/components/PayButton";
import Logo from "@/components/Logo";

const plans = [
  { id: "pro", name: "Pro", price: "₹300", desc: "For individual data engineers", popular: true },
  { id: "team", name: "Team", price: "₹600", desc: "For groups and small teams", popular: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#070B17] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-10">
        <Link href="/">
          <Logo size={30} />
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Pricing
        </h1>
        <p className="mt-2 text-gray-400">7-day free trial, then pick a plan to keep using Cogniflow.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 ${
                p.popular ? "border-[#2F6FED] bg-[#2F6FED]/10" : "border-white/10 bg-white/5"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#2F6FED] to-[#7C6AE8] px-3 py-0.5 text-[11px] font-medium">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-medium">{p.name}</h2>
              <p className="my-3 text-4xl font-semibold">
                {p.price}
                <span className="text-base font-normal text-gray-400"> / month</span>
              </p>
              <p className="mb-6 text-sm text-gray-400">{p.desc}</p>
              <PayButton
                planId={p.id}
                label={`Upgrade to ${p.name}`}
                className="w-full rounded-lg bg-gradient-to-r from-[#2F6FED] to-[#7C6AE8] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
          <p className="mb-1 font-medium text-gray-200">Test mode: no real money is charged</p>
          <p>
            Pay with card <span className="font-mono text-gray-200">4718 6091 0820 4366</span>, any future expiry,
            any CVV. Or choose Netbanking and click Success on the mock page.
          </p>
        </div>
      </main>
    </div>
  );
}