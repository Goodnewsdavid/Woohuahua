import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const microchip = searchParams.get("microchip")?.trim().replace(/\D/g, "") ?? "";
    if (microchip.length < 15) {
      return NextResponse.json(
        { error: "Please provide a valid 15-digit microchip number." },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findFirst({
      where: { microchipNumber: microchip },
      include: { user: true },
    });

    if (!pet) {
      return NextResponse.json({
        found: false,
        results: [],
      });
    }

    const user = pet.user;
    const ownerContactAvailable =
      !!(user.phone?.trim() || user.email) &&
      user.deletedAt == null &&
      user.isActive;

    return NextResponse.json({
      found: true,
      results: [
        {
          microchipNumber: pet.microchipNumber,
          petName: pet.name,
          species: pet.species.charAt(0).toUpperCase() + pet.species.slice(1),
          breed: pet.breed,
          status: pet.status,
          registeredDatabase: "Woo-Huahua Database",
          ownerContactAvailable,
        },
      ],
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
