import { connectDB } from "@/lib/mongodb"; // adjust to match your helper
import Payment from "@/models/Payment";
import UserPlan from "@/models/UserPlan";

const PLAN_DAYS = 30; // each payment buys 30 days. Change as you like.

export async function activatePlan(p: {
  userId: string;
  planId: string;
  paymentId: string;
  orderId: string;
  amount: number;
}): Promise<{ activated: boolean; alreadyProcessed: boolean }> {
  await connectDB();
  await Payment.init(); // makes sure the unique index on paymentId exists

  // 1. Record the payment. The unique index blocks duplicates, so verify
  //    and the webhook can both call this safely.
  try {
    await Payment.create(p);
  } catch (err: any) {
    if (err?.code === 11000) return { activated: false, alreadyProcessed: true };
    throw err;
  }

  // 2. Activate or extend the plan
  try {
    const now = new Date();
    const existing = await UserPlan.findOne({ userId: p.userId });
    const base = existing && existing.expiresAt > now ? existing.expiresAt : now;
    const expiresAt = new Date(base.getTime() + PLAN_DAYS * 24 * 60 * 60 * 1000);

    await UserPlan.findOneAndUpdate(
      { userId: p.userId },
      { planId: p.planId, expiresAt },
      { upsert: true, returnDocument: "after" }
    );
    return { activated: true, alreadyProcessed: false };
  } catch (err) {
    // Roll back the payment record so a retry can try again
    await Payment.deleteOne({ paymentId: p.paymentId });
    throw err;
  }
}

export async function getUserPlan(userId: string): Promise<string> {
  await connectDB();
  const doc = await UserPlan.findOne({ userId });
  return doc && doc.expiresAt > new Date() ? doc.planId : "free";
}