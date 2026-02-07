import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STRIPE_REGISTRATION_PRICE_PENCE = Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });

  let event: { type: string; data?: { object?: { id?: string; metadata?: { userId?: string }; payment_status?: string } } };
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, secret) as typeof event;
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sessionId = session?.id;
    const userId = session?.metadata?.userId;
    if (!sessionId || !userId) {
      console.error("checkout.session.completed missing session id or userId in metadata");
      return NextResponse.json({ error: "Bad event." }, { status: 400 });
    }

    try {
      await prisma.registrationPayment.create({
        data: {
          userId,
          stripeSessionId: sessionId,
          amountPence: STRIPE_REGISTRATION_PRICE_PENCE,
          currency: "gbp",
        },
      });
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return NextResponse.json({ received: true });
      }
      console.error("Failed to create RegistrationPayment:", e);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
