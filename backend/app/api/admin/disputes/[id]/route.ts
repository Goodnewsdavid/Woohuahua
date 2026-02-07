import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

const VALID_STATUSES = ["open", "under_review", "resolved"] as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute)
      return NextResponse.json({ error: "Dispute not found." }, { status: 404 });

    return NextResponse.json({
      id: dispute.id,
      userId: dispute.userId,
      subject: dispute.subject,
      description: dispute.description,
      status: dispute.status,
      createdAt: dispute.createdAt.toISOString(),
      updatedAt: dispute.updatedAt.toISOString(),
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
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute)
      return NextResponse.json(
        { error: "Dispute not found." },
        { status: 404 }
      );

    const body = await request.json().catch(() => ({}));
    const status =
      typeof body.status === "string" &&
      VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])
        ? (body.status as (typeof VALID_STATUSES)[number])
        : null;

    if (!status)
      return NextResponse.json(
        { error: "Valid status required: open, under_review, resolved." },
        { status: 400 }
      );

    const updated = await prisma.dispute.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      subject: updated.subject,
      description: updated.description,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
