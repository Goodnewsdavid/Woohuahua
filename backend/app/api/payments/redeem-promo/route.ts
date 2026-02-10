import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function POST(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const body = await request.json().catch(() => ({}));
    const raw = typeof body.code === "string" ? body.code : "";
    const code = normalizeCode(raw);
    if (!code) {
      return NextResponse.json({ error: "Please enter a code." }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });
    if (!promo) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 404 });
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "This code has reached its use limit." }, { status: 400 });
    }

    const uniqueSessionId = `PROMO-${promo.id}-${randomUUID()}`;

    await prisma.$transaction([
      prisma.registrationPayment.create({
        data: {
          userId,
          stripeSessionId: uniqueSessionId,
          amountPence: 0,
          currency: "gbp",
        },
      }),
      prisma.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: promo.usedCount + 1 },
      }),
    ]);

    const count = await prisma.registrationPayment.count({
      where: { userId, petId: null },
    });

    return NextResponse.json({
      success: true,
      message: "Code applied! You have one free registration.",
      credits: count,
    });
  } catch (e) {
    console.error("Redeem promo error:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
