import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get("resolved"); // "true" | "false" | omit (all)

    const [chatEscalations, callEscalations] = await Promise.all([
      prisma.chatSession.findMany({
        where: {
          humanEscalationRequested: true,
          ...(resolved === "false"
            ? { escalationResolvedAt: null }
            : resolved === "true"
              ? { escalationResolvedAt: { not: null } }
              : {}),
        },
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              role: true,
              content: true,
              metadata: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.callSession.findMany({
        where: {
          humanEscalationRequested: true,
          ...(resolved === "false"
            ? { escalationResolvedAt: null }
            : resolved === "true"
              ? { escalationResolvedAt: { not: null } }
              : {}),
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const items = [
      ...chatEscalations.map((c) => ({
        type: "chat" as const,
        id: c.id,
        sessionId: c.sessionId,
        userId: c.userId,
        tag: "User request" as const,
        humanEscalationRequested: c.humanEscalationRequested,
        escalationResolvedAt: c.escalationResolvedAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          metadata: m.metadata,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
      ...callEscalations.map((c) => ({
        type: "call" as const,
        id: c.id,
        twilioCallSid: c.twilioCallSid,
        userId: c.userId,
        tag:
          c.callerType === "emergency"
            ? ("Emergency" as const)
            : c.callerType === "organisation"
              ? ("Authorised organisation" as const)
              : ("User request" as const),
        humanEscalationRequested: c.humanEscalationRequested,
        escalationResolvedAt: c.escalationResolvedAt?.toISOString() ?? null,
        durationSeconds: c.durationSeconds,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
