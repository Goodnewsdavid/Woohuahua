import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: {
        emailVerifications: {
          where: { usedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found for this email." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "This email is already verified. You can sign in." },
        { status: 400 }
      );
    }

    let token: string;
    let expiresAt: Date;

    if (user.emailVerifications[0]) {
      token = user.emailVerifications[0].token;
      expiresAt = user.emailVerifications[0].expiresAt;
    } else {
      token = randomUUID();
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + VERIFICATION_EXPIRY_HOURS);
      await prisma.emailVerification.create({
        data: { userId: user.id, token, expiresAt },
      });
    }

    let baseUrl = (process.env.BACKEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    if (!/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`;
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const emailSent = await sendVerificationEmail(email, verificationUrl);
    if (!emailSent) console.log("Resend verification URL (email not sent):", verificationUrl);

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Verification email sent. Check your inbox."
        : "Email not configured. Use the link below to verify.",
      verificationUrl: emailSent ? undefined : verificationUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not resend verification. Please try again." },
      { status: 500 }
    );
  }
}
