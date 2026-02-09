import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMicrochipFormat, normalizeForSearch } from "@/lib/microchip";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const microchipRaw = searchParams.get("microchip")?.trim() ?? "";
    const chipValidation = validateMicrochipFormat(microchipRaw);
    if (!chipValidation.valid) {
      return NextResponse.json(
        { status: "ERROR", error: chipValidation.error, found: false, results: [] },
        { status: 200 }
      );
    }
    const searchKey = normalizeForSearch(microchipRaw);

    const pet = await prisma.pet.findFirst({
      where: { microchipSearchKey: searchKey },
      include: { user: true },
    });

    if (!pet) {
      await prisma.accessLog.create({
        data: { action: "CHIP_CHECK", microchipNumber: microchipRaw, details: { found: false } },
      });
      return NextResponse.json({
        status: "FALSE",
        found: false,
        results: [],
      });
    }

    await prisma.accessLog.create({
      data: { action: "CHIP_CHECK", microchipNumber: microchipRaw, details: { found: true, petId: pet.id } },
    });

    const user = pet.user;
    const ownerContactAvailable =
      !!(user.phone?.trim() || user.email) &&
      user.deletedAt == null &&
      user.isActive;

    return NextResponse.json({
      status: "TRUE",
      found: true,
      results: [
        {
          microchipNumber: pet.microchipNumber,
          petName: pet.name,
          species: pet.species === "other" && pet.speciesOther
            ? pet.speciesOther
            : pet.species.charAt(0).toUpperCase() + pet.species.slice(1),
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
