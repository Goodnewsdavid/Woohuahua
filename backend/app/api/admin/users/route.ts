import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const where: { OR?: object[] } = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { id: q },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        deletedAt: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        phone: true,
        postcode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      users.map((u) => ({
        ...u,
        deletedAt: u.deletedAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
