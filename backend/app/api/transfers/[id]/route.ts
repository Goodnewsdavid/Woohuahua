import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;
    const { id } = await params;

    const transfer = await prisma.transferRequest.findUnique({
      where: { id },
      include: { pet: true },
    });
    if (!transfer) {
      return NextResponse.json({ error: "Transfer request not found." }, { status: 404 });
    }
    if (transfer.toUserId !== userId) {
      return NextResponse.json({ error: "Only the receiver can accept or reject this transfer." }, { status: 403 });
    }
    if (transfer.status !== "pending") {
      return NextResponse.json({ error: "This transfer has already been accepted or rejected." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action === "accept" ? "accept" : body.action === "reject" ? "reject" : null;
    if (!action) {
      return NextResponse.json(
        { error: "Body must include action: 'accept' or 'reject'." },
        { status: 400 }
      );
    }

    if (action === "reject") {
      await prisma.transferRequest.update({
        where: { id },
        data: { status: "rejected" },
      });
      return NextResponse.json({ success: true, message: "Transfer rejected." });
    }

    if (action === "accept") {
      return NextResponse.json(
        {
          error: "To accept this transfer, please pay the transfer fee. Use the 'Accept and pay' button.",
          needPayment: true,
          transferRequestId: id,
        },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
