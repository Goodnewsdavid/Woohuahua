import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.redirect(`${frontendUrl}/login?verification=error`);
    }

    const record = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.redirect(`${frontendUrl}/login?verification=error`);
    }
    if (record.usedAt) {
      return NextResponse.redirect(`${frontendUrl}/login?verified=1`);
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.redirect(`${frontendUrl}/login?verification=expired`);
    }
    if (record.user.deletedAt) {
      return NextResponse.redirect(`${frontendUrl}/login?verification=error`);
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true, emailVerifiedAt: now },
      }),
      prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: now },
      }),
    ]);

    return NextResponse.redirect(`${frontendUrl}/login?verified=1`);
  } catch {
    const url = process.env.FRONTEND_URL || "http://localhost:8080";
    return NextResponse.redirect(`${url}/login?verification=error`);
  }
}
