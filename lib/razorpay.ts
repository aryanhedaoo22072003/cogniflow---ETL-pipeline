// import Razorpay from "razorpay";

// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export const PLANS = {
//   pro: { name: "Cogniflow Pro", amount: 30000 },   // ₹300 / month
//   team: { name: "Cogniflow Team", amount: 60000 }, // ₹600 / month
// } as const;

// export type PlanId = keyof typeof PLANS;


import Razorpay from "razorpay";

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("Razorpay keys are not configured");
    }
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

// Same `razorpay.orders...` usage as before, but created lazily.
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});

export const PLANS = {
  pro: { name: "Cogniflow Pro", amount: 30000 },   // ₹300 / month
  team: { name: "Cogniflow Team", amount: 60000 }, // ₹600 / month
} as const;

export type PlanId = keyof typeof PLANS;