import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body.code === "string" ? body.code : "";
    const code = normalizeCode(raw);
    if (!code) {
      return NextResponse.json({ valid: false, error: "Please enter a code." }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });
    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid or expired code." }, { status: 404 });
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its use limit." }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
