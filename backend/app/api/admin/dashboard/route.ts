import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const [totalUsers, activePets] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.pet.count({ where: { status: "registered" } }),
    ]);

    let openDisputes = 0;
    let pendingEscalations = 0;
    try {
      openDisputes = await prisma.dispute.count({ where: { status: "open" } });
    } catch {
      // Dispute table may not exist yet (migration not run)
    }
    try {
      const [chatEsc, callEsc] = await Promise.all([
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
      ]);
      pendingEscalations = chatEsc + callEsc;
    } catch {
      // escalationResolvedAt column may not exist yet (migration not run)
    }

    return NextResponse.json({
      totalUsers,
      activePets,
      openDisputes,
      pendingEscalations,
    });
  } catch (err) {
    console.error("[admin/dashboard]", err);
    return NextResponse.json(
      { error: "Request failed. Check server logs and database." },
      { status: 500 }
    );
  }
}
