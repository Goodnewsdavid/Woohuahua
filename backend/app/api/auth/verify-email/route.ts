import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json(
        { error: "Invalid or missing verification token." },
        { status: 400 }
      );
    }

    const record = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }
    if (record.usedAt) {
      return NextResponse.json(
        { error: "This verification link has already been used." },
        { status: 400 }
      );
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired." },
        { status: 400 }
      );
    }
    if (record.user.deletedAt) {
      return NextResponse.json(
        { error: "Account is no longer active." },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
