import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  return getStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata,
  });
}

export async function createCheckoutSession(params: {
  amount: number;
  studentId: string;
  feePaymentId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "School Fee Payment" },
          unit_amount: Math.round(params.amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      studentId: params.studentId,
      feePaymentId: params.feePaymentId,
    },
  });
}
