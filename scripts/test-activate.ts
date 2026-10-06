import mongoose from "mongoose";
import { activatePlan, getUserPlan } from "@/lib/subscriptions";
import Payment from "@/models/Payment";
import UserPlan from "@/models/UserPlan";

async function main() {
  const userId = "test_user_" + Date.now();
  const paymentId = "pay_test_" + Date.now();
  const args = { userId, planId: "pro", paymentId, orderId: "order_test", amount: 99900 };

  console.log("plan before:", await getUserPlan(userId));   // expect: free
  console.log("first call:", await activatePlan(args));     // expect: activated true
  console.log("second call:", await activatePlan(args));    // expect: alreadyProcessed true
  console.log("plan after:", await getUserPlan(userId));    // expect: pro

  await Payment.deleteOne({ paymentId });
  await UserPlan.deleteOne({ userId });
  console.log("cleaned up test data");
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });