import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  return stripe.paymentIntents.create({
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
  return stripe.checkout.sessions.create({
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
