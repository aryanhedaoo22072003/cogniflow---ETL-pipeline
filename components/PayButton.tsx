"use client";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayButton({
  planId,
  label,
  onSuccess,
}: {
  planId: string;
  label: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Cogniflow",
        description: `${planId} plan`,
        handler: async (response: any) => {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await v.json();
          if (result.ok) {
            onSuccess?.();
            alert("Payment successful");
          } else {
            alert("Payment verification failed");
          }
        },
        theme: { color: "#2F6FED" },
      });
      rzp.on("payment.failed", (r: any) => alert(r.error?.description ?? "Payment failed"));
      rzp.open();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button onClick={pay} disabled={loading}>
        {loading ? "Loading..." : label}
      </button>
    </>
  );
}