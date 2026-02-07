import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const PASSWORD_MIN_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : new URL(request.url).searchParams.get("token")?.trim() ?? "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or missing reset token." },
        { status: 400 }
      );
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const record = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }
    if (record.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used." },
        { status: 400 }
      );
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reset link has expired." },
        { status: 400 }
      );
    }
    if (record.user.deletedAt) {
      return NextResponse.json(
        { error: "Account is no longer active." },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, updatedAt: now },
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: now },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Password updated. You can now sign in.",
    });
  } catch {
    return NextResponse.json(
      { error: "Reset failed. Please try again." },
      { status: 500 }
    );
  }
}
