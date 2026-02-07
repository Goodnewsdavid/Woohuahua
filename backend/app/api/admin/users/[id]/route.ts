import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
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
        _count: { select: { pets: true } },
      },
    });
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({
      ...user,
      deletedAt: user.deletedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      petCount: user._count.pets,
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const deactivate = body.deactivate === true;
    const softDelete = body.softDelete === true;
    const reactivate = body.reactivate === true;

    if (reactivate) {
      await prisma.user.update({
        where: { id },
        data: { isActive: true, deletedAt: null },
      });
      return NextResponse.json({ ok: true, message: "User reactivated. They can log in again." });
    }
    if (softDelete) {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });
      return NextResponse.json({ ok: true, message: "User soft-deleted." });
    }
    if (deactivate) {
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ ok: true, message: "User deactivated." });
    }

    return NextResponse.json(
      { error: "No valid action. Use reactivate, deactivate, or softDelete." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
