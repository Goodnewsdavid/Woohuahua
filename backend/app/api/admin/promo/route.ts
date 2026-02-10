import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const list = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((p) => ({
        id: p.id,
        code: p.code,
        maxUses: p.maxUses,
        usedCount: p.usedCount,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[admin/promo GET]", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body.code === "string" ? body.code : "";
    const code = normalizeCode(raw);
    if (!code) {
      return NextResponse.json({ error: "Code is required." }, { status: 400 });
    }
    const maxUses = typeof body.maxUses === "number" && body.maxUses > 0 ? body.maxUses : null;

    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "A promo code with this code already exists." }, { status: 409 });
    }

    const promo = await prisma.promoCode.create({
      data: { code, maxUses },
    });
    return NextResponse.json({
      id: promo.id,
      code: promo.code,
      maxUses: promo.maxUses,
      usedCount: promo.usedCount,
      createdAt: promo.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("[admin/promo POST]", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
