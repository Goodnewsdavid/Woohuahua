import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const STRIPE_REGISTRATION_PRICE_PENCE = Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;

/**
 * When the user returns from Stripe checkout (success URL), we grant a credit by
 * verifying the session with Stripe and creating a RegistrationPayment if needed.
 * This makes payment work in local dev where the webhook cannot be reached.
 */
export async function GET(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id")?.trim();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed." }, { status: 400 });
    }
    const metaUserId = (session.metadata as { userId?: string } | null)?.userId;
    if (metaUserId !== userId) {
      return NextResponse.json({ error: "Session does not belong to this user." }, { status: 403 });
    }

    try {
      await prisma.registrationPayment.create({
        data: {
          userId,
          stripeSessionId: session.id,
          amountPence: STRIPE_REGISTRATION_PRICE_PENCE,
          currency: "gbp",
        },
      });
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return NextResponse.json({ credited: true });
      }
      throw e;
    }

    return NextResponse.json({ credited: true });
  } catch (e) {
    console.error("Confirm session error:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
