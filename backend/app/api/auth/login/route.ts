import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_EXPIRY_DAYS = 7;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
  const email = typeof body === "object" && body !== null && "email" in body && typeof (body as { email: unknown }).email === "string"
    ? (body as { email: string }).email.trim()
    : "";
  const password = typeof body === "object" && body !== null && "password" in body && typeof (body as { password: unknown }).password === "string"
    ? (body as { password: string }).password
    : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        deletedAt: null,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    const hash = user.passwordHash;
    let passwordOk = false;
    if (typeof hash === "string" && hash.length > 0) {
      try {
        passwordOk = bcrypt.compareSync(password, hash);
      } catch {
        // invalid hash format
      }
    }
    if (!passwordOk) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + JWT_EXPIRY_DAYS);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: `${JWT_EXPIRY_DAYS}d` }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    const message = err instanceof Error ? err.message : String(err);
    const allowDetail = process.env.LOGIN_ERROR_DETAIL === "1";
    return NextResponse.json(
      {
        error: "Login failed. Please try again.",
        ...(allowDetail && { detail: message }),
      },
      { status: 500 }
    );
  }
}
