import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text(); // raw body, required for signature check
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "order.paid") {
    const order = event.payload.order.entity;
    const payment = event.payload.payment.entity;
    const { userId, planId } = order.notes ?? {};

    // TODO: activate the plan (idempotent, same as verify route)
    // await activatePlan({ userId, planId, paymentId: payment.id });
    console.log("order.paid", { userId, planId, paymentId: payment.id });
  }

  return NextResponse.json({ ok: true });
}