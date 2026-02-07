import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getUserIdFromRequest(request);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const count = await prisma.registrationPayment.count({
      where: { userId, petId: null },
    });

    return NextResponse.json({ credits: count });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
