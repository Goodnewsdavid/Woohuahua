import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { validateMicrochipFormat, normalizeForSearch } from "@/lib/microchip";

const VALID_SPECIES = ["dog", "cat", "rabbit", "ferret", "other"] as const;

function toPetResponse(pet: {
  id: string;
  microchipNumber: string;
  name: string;
  species: string;
  speciesOther: string | null;
  breed: string;
  color: string;
  dateOfBirth: Date | null;
  sex: string;
  neutered: boolean;
  notes: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: pet.id,
    microchipNumber: pet.microchipNumber,
    name: pet.name,
    species: pet.species,
    speciesOther: pet.speciesOther ?? null,
    breed: pet.breed,
    color: pet.color,
    dateOfBirth: pet.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    sex: pet.sex,
    neutered: pet.neutered,
    notes: pet.notes ?? null,
    imageUrl: pet.imageUrl ?? null,
    status: pet.status,
    registeredDate: pet.createdAt.toISOString(),
    createdAt: pet.createdAt.toISOString(),
    updatedAt: pet.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const pets = await prisma.pet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pets.map(toPetResponse));
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const body = await request.json().catch(() => ({}));
    const microchipRaw = typeof body.microchipNumber === "string" ? body.microchipNumber.trim() : "";
    const name = typeof body.petName === "string" ? body.petName.trim() : (typeof body.name === "string" ? body.name.trim() : "");
    const speciesRaw = typeof body.species === "string" ? body.species.trim().toLowerCase() : "";
    const speciesOther = typeof body.speciesOther === "string" ? body.speciesOther.trim() || null : null;
    const breed = typeof body.breed === "string" ? body.breed.trim() : "";
    const color = typeof body.color === "string" ? body.color.trim() : "";
    const dateOfBirthRaw = body.dateOfBirth;
    const sex = typeof body.sex === "string" ? body.sex.trim().toLowerCase() : "";
    const neutered = Boolean(body.neutered);
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;

    const chipValidation = validateMicrochipFormat(microchipRaw);
    if (!chipValidation.valid) {
      return NextResponse.json({ error: chipValidation.error }, { status: 400 });
    }
    const microchipNumber = microchipRaw;
    const microchipSearchKey = normalizeForSearch(microchipRaw);
    if (!name) {
      return NextResponse.json({ error: "Pet name is required." }, { status: 400 });
    }
    if (!VALID_SPECIES.includes(speciesRaw as (typeof VALID_SPECIES)[number])) {
      return NextResponse.json(
        { error: "Species must be one of: dog, cat, rabbit, ferret, other." },
        { status: 400 }
      );
    }
    if (speciesRaw === "other" && !speciesOther) {
      return NextResponse.json(
        { error: "Please specify the species (e.g. Hamster, Bird) when selecting Other." },
        { status: 400 }
      );
    }
    if (!breed) {
      return NextResponse.json({ error: "Breed is required." }, { status: 400 });
    }
    if (!color) {
      return NextResponse.json({ error: "Color is required." }, { status: 400 });
    }
    if (sex !== "male" && sex !== "female") {
      return NextResponse.json({ error: "Sex must be male or female." }, { status: 400 });
    }

    let dateOfBirth: Date | null = null;
    if (dateOfBirthRaw) {
      const d = new Date(dateOfBirthRaw);
      if (!isNaN(d.getTime())) dateOfBirth = d;
    }

    const existing = await prisma.pet.findFirst({
      where: { microchipSearchKey },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A pet with this microchip number is already registered." },
        { status: 409 }
      );
    }

    const unusedPayment = await prisma.registrationPayment.findFirst({
      where: { userId, petId: null },
      orderBy: { createdAt: "asc" },
    });
    if (!unusedPayment) {
      return NextResponse.json(
        { error: "Payment required. Registering a microchip costs £24.99 per pet. Please pay first then add your pet.", code: "PAYMENT_REQUIRED" },
        { status: 402 }
      );
    }

    const pet = await prisma.pet.create({
      data: {
        userId,
        microchipNumber,
        microchipSearchKey,
        name,
        species: speciesRaw as "dog" | "cat" | "rabbit" | "ferret" | "other",
        speciesOther: speciesRaw === "other" ? speciesOther : null,
        breed,
        color,
        dateOfBirth,
        sex,
        neutered,
        notes,
        imageUrl,
      },
    });

    await prisma.registrationPayment.update({
      where: { id: unusedPayment.id },
      data: { petId: pet.id },
    });

    return NextResponse.json(toPetResponse(pet), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
