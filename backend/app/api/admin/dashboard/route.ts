import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const [totalUsers, activePets, openDisputes, pendingEscalations] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.pet.count({ where: { status: "registered" } }),
      prisma.dispute.count({ where: { status: "open" } }),
      Promise.all([
        prisma.chatSession.count({
          where: {
            humanEscalationRequested: true,
            escalationResolvedAt: null,
          },
        }),
        prisma.callSession.count({
          where: {
            humanEscalationRequested: true,
            escalationResolvedAt: null,
          },
        }),
      ]).then(([a, b]) => a + b),
    ]);

    return NextResponse.json({
      totalUsers,
      activePets,
      openDisputes,
      pendingEscalations,
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
