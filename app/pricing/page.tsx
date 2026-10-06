import PayButton from "@/components/PayButton";

const plans = [
  { id: "pro", name: "Pro", price: "₹300", desc: "For individual data engineers" },
  { id: "team", name: "Team", price: "₹600", desc: "For groups and small teams" },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold mb-2">Pricing</h1>
      <p className="text-gray-500 mb-8">
        7-day free trial, then pick a plan to keep using Cogniflow.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((p) => (
          <div key={p.id} className="rounded-xl border p-6">
            <h2 className="text-xl font-medium">{p.name}</h2>
            <p className="text-3xl font-semibold my-3">
              {p.price}
              <span className="text-base font-normal text-gray-500"> / month</span>
            </p>
            <p className="text-sm text-gray-500 mb-5">{p.desc}</p>
            <PayButton planId={p.id} label={`Upgrade to ${p.name}`} />
          </div>
        ))}
      </div>
    </main>
  );
}