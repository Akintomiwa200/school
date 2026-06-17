import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { generateReceiptNumber } from "@/shared";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { studentId, feePaymentId } = session.metadata ?? {};

      if (studentId && feePaymentId) {
        const amount = (session.amount_total ?? 0) / 100;
        await prisma.payment.create({
          data: {
            studentId,
            feePaymentId,
            amount,
            method: "ONLINE",
            status: "COMPLETED",
            transactionId: session.payment_intent as string,
            receiptNumber: generateReceiptNumber(),
            paidAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
