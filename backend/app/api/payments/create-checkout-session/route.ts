import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

const STRIPE_REGISTRATION_PRICE_PENCE = Number(process.env.STRIPE_REGISTRATION_PRICE_PENCE) || 2499;

export async function POST(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const Stripe = (await import("stripe")).default;
    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    if (!secret.startsWith("sk_")) return NextResponse.json({ error: "Invalid Stripe key: use your Secret key (starts with sk_test_ or sk_live_), not the Publishable key (pk_)." }, { status: 503 });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const base = request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: STRIPE_REGISTRATION_PRICE_PENCE,
            product_data: {
              name: "Microchip registration",
              description: "Register one microchip with us and get lifetime access to update your pet's details.",
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: `${frontendUrl}/register?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/register?payment=cancelled`,
    });

    const url = session.url;
    if (!url) return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Create checkout session error:", e);
    const err = e as { type?: string; message?: string };
    if (err.type === "StripeAuthenticationError" || err.message?.toLowerCase().includes("invalid api key")) {
      return NextResponse.json({ error: "Invalid Stripe key. Check STRIPE_SECRET_KEY in .env (use test key for development)." }, { status: 503 });
    }
    if (err.type?.startsWith("Stripe")) {
      return NextResponse.json({ error: err.message ?? "Stripe error. Check backend logs." }, { status: 500 });
    }
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
