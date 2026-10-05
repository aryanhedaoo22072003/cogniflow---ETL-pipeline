import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  // 1. Verify the signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(razorpay_signature);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  // 2. Make sure this order belongs to the signed-in user
  const order = await razorpay.orders.fetch(razorpay_order_id);
  if (order.notes?.userId !== userId) {
    return NextResponse.json({ ok: false, error: "Order mismatch" }, { status: 403 });
  }

  const planId = order.notes?.planId as string;

  // TODO: activate the plan in your DB. Make it idempotent:
  // if this razorpay_payment_id is already recorded, do nothing.
  // await activatePlan({ userId, planId, paymentId: razorpay_payment_id });

  return NextResponse.json({ ok: true, planId });
}