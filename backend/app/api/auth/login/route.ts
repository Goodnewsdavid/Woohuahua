import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_EXPIRY_DAYS = 7;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    // Match email case-insensitively so Test@ and test@ both work
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
    const passwordOk =
      typeof hash === "string" &&
      hash.length > 0 &&
      bcrypt.compareSync(password, hash);
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
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
