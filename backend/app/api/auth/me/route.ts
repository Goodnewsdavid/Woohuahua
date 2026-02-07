import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    let payload: { userId?: string; role?: string };
    try {
      payload = jwt.verify(token, secret) as { userId: string; role: string };
    } catch {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
    }

    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      phone: user.phone ?? null,
      postcode: user.postcode ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Request failed." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const body = await request.json().catch(() => ({}));
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() || null : undefined;
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() || null : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : undefined;
    const postcode = typeof body.postcode === "string" ? body.postcode.trim() || null : undefined;

    const updateData: { firstName?: string | null; lastName?: string | null; phone?: string | null; postcode?: string | null } = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (postcode !== undefined) updateData.postcode = postcode;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      role: updated.role,
      emailVerified: updated.emailVerified,
      emailVerifiedAt: updated.emailVerifiedAt,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      firstName: updated.firstName ?? null,
      lastName: updated.lastName ?? null,
      phone: updated.phone ?? null,
      postcode: updated.postcode ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
