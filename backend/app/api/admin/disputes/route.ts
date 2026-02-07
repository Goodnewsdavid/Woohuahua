import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

const VALID_STATUSES = ["open", "under_review", "resolved"] as const;

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toLowerCase();

    const where =
      status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
        ? { status: status as (typeof VALID_STATUSES)[number] }
        : {};

    const disputes = await prisma.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      disputes.map((d) => ({
        id: d.id,
        userId: d.userId,
        subject: d.subject,
        description: d.description,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const userId =
      typeof body.userId === "string" ? body.userId.trim() || null : null;

    if (!subject || !description)
      return NextResponse.json(
        { error: "Subject and description are required." },
        { status: 400 }
      );

    const dispute = await prisma.dispute.create({
      data: { userId, subject, description },
    });

    return NextResponse.json(
      {
        id: dispute.id,
        userId: dispute.userId,
        subject: dispute.subject,
        description: dispute.description,
        status: dispute.status,
        createdAt: dispute.createdAt.toISOString(),
        updatedAt: dispute.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
