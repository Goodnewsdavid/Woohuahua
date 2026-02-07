import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PATCH(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const type = body.type === "chat" ? "chat" : body.type === "call" ? "call" : null;
    const id = typeof body.id === "string" ? body.id.trim() : null;

    if (!type || !id)
      return NextResponse.json(
        { error: "Body must include type: 'chat' | 'call' and id." },
        { status: 400 }
      );

    const now = new Date();

    if (type === "chat") {
      const session = await prisma.chatSession.findFirst({
        where: { id, humanEscalationRequested: true },
      });
      if (!session)
        return NextResponse.json(
          { error: "Chat escalation not found." },
          { status: 404 }
        );
      await prisma.chatSession.update({
        where: { id },
        data: { escalationResolvedAt: now },
      });
      return NextResponse.json({ ok: true, message: "Chat escalation marked resolved." });
    }

    const session = await prisma.callSession.findFirst({
      where: { id, humanEscalationRequested: true },
    });
    if (!session)
      return NextResponse.json(
        { error: "Call escalation not found." },
        { status: 404 }
      );
    await prisma.callSession.update({
      where: { id },
      data: { escalationResolvedAt: now },
    });
    return NextResponse.json({ ok: true, message: "Call escalation marked resolved." });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
