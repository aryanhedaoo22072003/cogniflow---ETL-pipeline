import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay, PLANS, PlanId } from "@/lib/razorpay";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();
  const plan = PLANS[planId as PlanId];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `cf_${Date.now()}`, // max 40 chars
      notes: { planId, userId },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json(
      { error: err?.error?.description ?? "Could not create order" },
      { status: 500 }
    );
  }
}