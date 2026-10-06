import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  pro: { name: "Cogniflow Pro", amount: 30000 },   // ₹300 / month
  team: { name: "Cogniflow Team", amount: 60000 }, // ₹600 / month
} as const;

export type PlanId = keyof typeof PLANS;