import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Amounts are in paise (99900 = ₹999). Placeholder prices, change them.
export const PLANS = {
  pro: { name: "Cogniflow Pro", amount: 99900 },
  team: { name: "Cogniflow Team", amount: 299900 },
} as const;

export type PlanId = keyof typeof PLANS;