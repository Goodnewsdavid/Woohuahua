import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorisedFromRequest } from "@/lib/auth";
import { validateMicrochipFormat, normalizeForSearch } from "@/lib/microchip";

/** Reg 7(1)(c): provide Reg 6 info to authorised persons. Reg 7(1)(e): identify authorised person. Reg 7(1)(g): log access. */
export async function GET(request: Request) {
  try {
    const auth = await getAuthorisedFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const { searchParams } = new URL(request.url);
    const microchipRaw = searchParams.get("microchip")?.trim() ?? "";
    const chipValidation = validateMicrochipFormat(microchipRaw);
    if (!chipValidation.valid) {
      await prisma.accessLog.create({
        data: {
          userId,
          action: "AUTHORISED_LOOKUP",
          microchipNumber: microchipRaw || null,
          details: { error: chipValidation.error },
        },
      });
      return NextResponse.json({ error: chipValidation.error }, { status: 400 });
    }

    const searchKey = normalizeForSearch(microchipRaw);
    const pet = await prisma.pet.findFirst({
      where: { microchipSearchKey: searchKey },
      include: { user: true },
    });

    if (!pet) {
      await prisma.accessLog.create({
        data: {
          userId,
          action: "AUTHORISED_LOOKUP",
          microchipNumber: microchipRaw,
          details: { found: false },
        },
      });
      return NextResponse.json({ found: false, message: "No record found for this microchip." });
    }

    const keeper = pet.user;
    const address = [keeper.addressLine1, keeper.city, keeper.postcode].filter(Boolean).join(", ") || null;

    await prisma.accessLog.create({
      data: {
        userId,
        action: "AUTHORISED_LOOKUP",
        microchipNumber: microchipRaw,
        details: { found: true, petId: pet.id },
      },
    });

    return NextResponse.json({
      found: true,
      keeper: {
        fullName: [keeper.firstName, keeper.lastName].filter(Boolean).join(" ") || keeper.email,
        address,
        phone: keeper.phone ?? null,
        email: keeper.email,
      },
      pet: {
        microchipNumber: pet.microchipNumber,
        name: pet.name,
        species: pet.species,
        speciesOther: pet.speciesOther ?? null,
        breed: pet.breed,
        color: pet.color,
        sex: pet.sex,
        dateOfBirth: pet.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        status: pet.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
