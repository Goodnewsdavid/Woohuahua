import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const VALID_SPECIES = ["dog", "cat", "rabbit", "ferret", "other"] as const;
const VALID_STATUSES = ["registered", "lost", "found", "transferred", "deceased"] as const;

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;
    const { id } = await params;

    const pet = await prisma.pet.findFirst({
      where: { id, userId },
    });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }
    return NextResponse.json(toPetResponse(pet));
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;
    const { id } = await params;

    const pet = await prisma.pet.findFirst({
      where: { id, userId },
    });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updateData: {
      name?: string;
      speciesOther?: string | null;
      breed?: string;
      color?: string;
      dateOfBirth?: Date | null;
      sex?: string;
      neutered?: boolean;
      notes?: string | null;
      imageUrl?: string | null;
      status?: (typeof VALID_STATUSES)[number];
    } = {};

    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (body.speciesOther !== undefined) updateData.speciesOther = typeof body.speciesOther === "string" ? body.speciesOther.trim() || null : null;
    if (typeof body.breed === "string" && body.breed.trim()) updateData.breed = body.breed.trim();
    if (typeof body.color === "string" && body.color.trim()) updateData.color = body.color.trim();
    if (typeof body.sex === "string" && (body.sex === "male" || body.sex === "female")) updateData.sex = body.sex;
    if (typeof body.neutered === "boolean") updateData.neutered = body.neutered;
    if (typeof body.notes === "string") updateData.notes = body.notes.trim() || null;
    if (typeof body.imageUrl === "string") updateData.imageUrl = body.imageUrl.trim() || null;
    if (typeof body.status === "string" && VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
      updateData.status = body.status as (typeof VALID_STATUSES)[number];
    }
    if (body.dateOfBirth !== undefined) {
      if (body.dateOfBirth === null || body.dateOfBirth === "") {
        updateData.dateOfBirth = null;
      } else {
        const d = new Date(body.dateOfBirth);
        if (!isNaN(d.getTime())) updateData.dateOfBirth = d;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const updated = await prisma.pet.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(toPetResponse(updated));
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
