// import crypto from "crypto";
// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { razorpay } from "@/lib/razorpay";
// import { activatePlan } from "@/lib/subscriptions";

// export async function POST(req: Request) {
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     await req.json();

//   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//     return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
//   }

//   // 1. Verify the signature
//   const expected = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   const a = Buffer.from(expected);
//   const b = Buffer.from(razorpay_signature);
//   if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
//     return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
//   }

//   // 2. Make sure this order belongs to the signed-in user
//   const order = await razorpay.orders.fetch(razorpay_order_id);
//   if (order.notes?.userId !== userId) {
//     return NextResponse.json({ ok: false, error: "Order mismatch" }, { status: 403 });
//   }

//   const planId = order.notes?.planId as string;

//   // 3. Save the payment and activate the plan
//   await activatePlan({
//     userId,
//     planId,
//     paymentId: razorpay_payment_id,
//     orderId: razorpay_order_id,
//     amount: Number(order.amount),
//   });

//   return NextResponse.json({ ok: true, planId });
// }

import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";
import { activatePlan } from "@/lib/subscriptions";

export const maxDuration = 30; // fail in 30s instead of 300s

function step<T>(label: string, p: Promise<T>, ms = 15000): Promise<T> {
  console.log(`[verify] start: ${label}`);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timed out at step: ${label}`)), ms);
    p.then(
      (v) => { clearTimeout(t); console.log(`[verify] done: ${label}`); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await step("clerk auth", auth());
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
    }
    console.log("[verify] signature ok");

    const order: any = await step("razorpay order fetch", razorpay.orders.fetch(razorpay_order_id));
    if (order.notes?.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Order mismatch" }, { status: 403 });
    }

    const planId = order.notes?.planId as string;

    await step(
      "save payment + activate plan",
      activatePlan({
        userId,
        planId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: Number(order.amount),
      })
    );

    return NextResponse.json({ ok: true, planId });
  } catch (e: any) {
    console.error("[verify] failed:", e?.message);
    return NextResponse.json({ ok: false, error: e?.message ?? "verify failed" }, { status: 500 });
  }
}