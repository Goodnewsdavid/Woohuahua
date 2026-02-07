import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const [incoming, outgoing] = await Promise.all([
      prisma.transferRequest.findMany({
        where: { toUserId: userId, status: "pending" },
        orderBy: { createdAt: "desc" },
        include: {
          pet: { select: { id: true, name: true, microchipNumber: true, species: true } },
          from: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.transferRequest.findMany({
        where: { fromUserId: userId, status: { in: ["pending", "rejected"] } },
        orderBy: { createdAt: "desc" },
        include: {
          pet: { select: { id: true, name: true, microchipNumber: true } },
          to: { select: { id: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      incoming: incoming.map((t) => ({
        id: t.id,
        petId: t.pet.id,
        petName: t.pet.name,
        microchipNumber: t.pet.microchipNumber,
        species: t.pet.species,
        fromEmail: t.from.email,
        fromName: t.from.firstName || t.from.lastName ? [t.from.firstName, t.from.lastName].filter(Boolean).join(" ") : null,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      outgoing: outgoing.map((t) => ({
        id: t.id,
        petId: t.pet.id,
        petName: t.pet.name,
        microchipNumber: t.pet.microchipNumber,
        toEmail: t.to.email,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
