import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const STRIPE_TRANSFER_FEE_PENCE = Number(process.env.STRIPE_TRANSFER_FEE_PENCE) || Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;

/**
 * When the new owner returns from Stripe checkout (success URL), we complete the transfer:
 * create TransferPayment, update TransferRequest to accepted, move Pet to new owner.
 * Idempotent: if this session was already processed, returns success.
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

    const meta = (session.metadata || {}) as { type?: string; transferRequestId?: string; toUserId?: string };
    if (meta.type !== "transfer" || !meta.transferRequestId || meta.toUserId !== userId) {
      return NextResponse.json({ error: "Invalid session for transfer." }, { status: 403 });
    }

    const transferRequestId = meta.transferRequestId;

    const existing = await prisma.transferPayment.findUnique({
      where: { stripeSessionId: sessionId },
    });
    if (existing) {
      return NextResponse.json({ success: true, message: "Transfer already completed.", completed: true });
    }

    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferRequestId },
      include: { pet: true },
    });
    if (!transfer) {
      return NextResponse.json({ error: "Transfer request not found." }, { status: 404 });
    }
    if (transfer.toUserId !== userId) {
      return NextResponse.json({ error: "You are not the recipient of this transfer." }, { status: 403 });
    }
    if (transfer.status !== "pending") {
      return NextResponse.json({ success: true, message: "Transfer already completed.", completed: true });
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

    return NextResponse.json({
      success: true,
      message: `You are now the owner of ${transfer.pet.name}.`,
      completed: true,
    });
  } catch (e) {
    console.error("Confirm transfer session error:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
