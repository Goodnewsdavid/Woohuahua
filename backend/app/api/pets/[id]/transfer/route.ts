import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId: currentUserId } = auth;
    const { id: petId } = await params;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: currentUserId },
    });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const newOwnerEmail =
      typeof body.newOwnerEmail === "string" ? body.newOwnerEmail.trim().toLowerCase() : "";

    if (!newOwnerEmail) {
      return NextResponse.json(
        { error: "New owner email is required." },
        { status: 400 }
      );
    }

    const newOwner = await prisma.user.findFirst({
      where: {
        email: newOwnerEmail,
        deletedAt: null,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!newOwner) {
      return NextResponse.json(
        {
          error:
            "No active verified account found for that email. The new owner must sign up and verify their email first.",
        },
        { status: 404 }
      );
    }

    if (newOwner.id === currentUserId) {
      return NextResponse.json(
        { error: "You cannot transfer a pet to yourself." },
        { status: 400 }
      );
    }

    await prisma.pet.update({
      where: { id: petId },
      data: { userId: newOwner.id },
    });

    return NextResponse.json({
      success: true,
      message: `Ownership of ${pet.name} has been transferred to ${newOwnerEmail}.`,
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
