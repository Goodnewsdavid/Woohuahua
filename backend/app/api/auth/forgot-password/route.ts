import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_EXPIRY_HOURS = 1;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a reset link.",
      });
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_EXPIRY_HOURS);

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    console.log("Password reset URL:", resetUrl);

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a reset link.",
      resetUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Request failed. Please try again." },
      { status: 500 }
    );
  }
}
