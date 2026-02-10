import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const STRIPE_TRANSFER_FEE_PENCE = Number(process.env.STRIPE_TRANSFER_FEE_PENCE) || Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;

export async function POST(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const body = await request.json().catch(() => ({}));
    const transferRequestId = typeof body.transferRequestId === "string" ? body.transferRequestId.trim() : "";
    if (!transferRequestId) {
      return NextResponse.json({ error: "transferRequestId is required." }, { status: 400 });
    }

    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferRequestId },
      include: { pet: true, payment: true },
    });
    if (!transfer) {
      return NextResponse.json({ error: "Transfer request not found." }, { status: 404 });
    }
    if (transfer.toUserId !== userId) {
      return NextResponse.json({ error: "Only the receiver can pay for this transfer." }, { status: 403 });
    }
    if (transfer.status !== "pending") {
      return NextResponse.json({ error: "This transfer has already been completed or rejected." }, { status: 400 });
    }
    if (transfer.payment) {
      return NextResponse.json({ error: "This transfer has already been paid." }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    if (!secret.startsWith("sk_")) {
      return NextResponse.json({ error: "Invalid Stripe key: use your Secret key (sk_test_ or sk_live_), not the Publishable key." }, { status: 503 });
    }

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:8080").replace(/\/$/, "");

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: STRIPE_TRANSFER_FEE_PENCE,
            product_data: {
              name: "Transfer of ownership fee",
              description: `Complete transfer of ${transfer.pet.name} to your account. One-time fee.`,
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "transfer",
        transferRequestId: transfer.id,
        toUserId: userId,
      },
      success_url: `${frontendUrl}/transfer-requests?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/transfer-requests?payment=cancelled`,
    });

    const url = session.url;
    if (!url) return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Create transfer checkout session error:", e);
    const err = e as { type?: string; message?: string };
    if (err.type === "StripeAuthenticationError" || err.message?.toLowerCase().includes("invalid api key")) {
      return NextResponse.json({ error: "Invalid Stripe key. Check STRIPE_SECRET_KEY." }, { status: 503 });
    }
    if (err.type?.startsWith("Stripe")) {
      return NextResponse.json({ error: err.message ?? "Stripe error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
