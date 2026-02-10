import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STRIPE_REGISTRATION_PRICE_PENCE = Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;
const STRIPE_TRANSFER_FEE_PENCE = Number(process.env.STRIPE_TRANSFER_FEE_PENCE) || Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;

type SessionMetadata = { userId?: string; type?: string; transferRequestId?: string; toUserId?: string };

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });

  let event: { type: string; data?: { object?: { id?: string; metadata?: SessionMetadata; payment_status?: string } } };
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
    const metadata = (session?.metadata || {}) as SessionMetadata;

    if (!sessionId) {
      console.error("checkout.session.completed missing session id");
      return NextResponse.json({ error: "Bad event." }, { status: 400 });
    }

    if (metadata.type === "transfer") {
      const transferRequestId = metadata.transferRequestId;
      if (!transferRequestId) {
        console.error("transfer session missing transferRequestId");
        return NextResponse.json({ error: "Bad event." }, { status: 400 });
      }
      try {
        const transfer = await prisma.transferRequest.findUnique({
          where: { id: transferRequestId },
          include: { payment: true },
        });
        if (!transfer || transfer.status !== "pending" || transfer.payment) {
          return NextResponse.json({ received: true });
        }
        await prisma.$transaction([
          prisma.transferPayment.create({
            data: {
              transferRequestId: transfer.id,
              stripeSessionId: sessionId,
              amountPence: STRIPE_TRANSFER_FEE_PENCE,
              currency: "gbp",
            },
          }),
          prisma.pet.update({
            where: { id: transfer.petId },
            data: { userId: transfer.toUserId },
          }),
          prisma.transferRequest.update({
            where: { id: transfer.id },
            data: { status: "accepted" },
          }),
        ]);
      } catch (e) {
        if ((e as { code?: string }).code === "P2002") {
          return NextResponse.json({ received: true });
        }
        console.error("Failed to process transfer payment:", e);
        return NextResponse.json({ error: "Database error." }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }

    const userId = metadata.userId;
    if (!userId) {
      console.error("checkout.session.completed missing userId in metadata");
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
