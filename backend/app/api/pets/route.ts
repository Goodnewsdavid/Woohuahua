import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const VALID_SPECIES = ["dog", "cat", "rabbit", "ferret", "other"] as const;

function toPetResponse(pet: {
  id: string;
  microchipNumber: string;
  name: string;
  species: string;
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
    const microchipNumber = typeof body.microchipNumber === "string" ? body.microchipNumber.trim() : "";
    const name = typeof body.petName === "string" ? body.petName.trim() : (typeof body.name === "string" ? body.name.trim() : "");
    const speciesRaw = typeof body.species === "string" ? body.species.trim().toLowerCase() : "";
    const breed = typeof body.breed === "string" ? body.breed.trim() : "";
    const color = typeof body.color === "string" ? body.color.trim() : "";
    const dateOfBirthRaw = body.dateOfBirth;
    const sex = typeof body.sex === "string" ? body.sex.trim().toLowerCase() : "";
    const neutered = Boolean(body.neutered);
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

    if (!microchipNumber || microchipNumber.length < 15) {
      return NextResponse.json(
        { error: "Valid microchip number (at least 15 characters) is required." },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json({ error: "Pet name is required." }, { status: 400 });
    }
    if (!VALID_SPECIES.includes(speciesRaw as (typeof VALID_SPECIES)[number])) {
      return NextResponse.json(
        { error: "Species must be one of: dog, cat, rabbit, ferret, other." },
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
      where: { microchipNumber },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A pet with this microchip number is already registered." },
        { status: 409 }
      );
    }

    const pet = await prisma.pet.create({
      data: {
        userId,
        microchipNumber,
        name,
        species: speciesRaw as "dog" | "cat" | "rabbit" | "ferret" | "other",
        breed,
        color,
        dateOfBirth,
        sex,
        neutered,
        notes,
      },
    });

    return NextResponse.json(toPetResponse(pet), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
