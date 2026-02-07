import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAdminFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const pets = await prisma.pet.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      pets.map((p) => ({
        id: p.id,
        microchipNumber: p.microchipNumber,
        name: p.name,
        species: p.species,
        breed: p.breed,
        color: p.color,
        dateOfBirth: p.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        sex: p.sex,
        neutered: p.neutered,
        notes: p.notes ?? null,
        imageUrl: p.imageUrl ?? null,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        owner: p.user
          ? {
              id: p.user.id,
              email: p.user.email,
              firstName: p.user.firstName ?? null,
              lastName: p.user.lastName ?? null,
              isActive: p.user.isActive,
              deletedAt: p.user.deletedAt?.toISOString() ?? null,
            }
          : null,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
