import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function getUserIdFromRequest(
  request: Request
): Promise<{ userId: string } | { error: Response }> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const secret = process.env.JWT_SECRET;
  if (!secret) return { error: NextResponse.json({ error: "Server configuration error." }, { status: 500 }) };

  let payload: { userId?: string };
  try {
    payload = jwt.verify(token, secret) as { userId: string };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token." }, { status: 401 }) };
  }
  if (!payload.userId) return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  return { userId: payload.userId };
}

/** Returns userId if authenticated; null if no token or invalid. Does not error. */
export async function getOptionalUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const payload = jwt.verify(token, secret) as { userId?: string };
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

/** For admin routes: returns { adminId } if token is valid and user has role ADMIN; else error response. */
export async function getAdminFromRequest(
  request: Request
): Promise<{ adminId: string } | { error: Response }> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token)
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const secret = process.env.JWT_SECRET;
  if (!secret)
    return { error: NextResponse.json({ error: "Server configuration error." }, { status: 500 }) };

  let payload: { userId?: string; role?: string };
  try {
    payload = jwt.verify(token, secret) as { userId: string; role: string };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token." }, { status: 401 }) };
  }
  if (!payload.userId || payload.role !== "ADMIN")
    return { error: NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 }) };

  return { adminId: payload.userId };
}

/** For authorised-person routes (Reg 7(1)(e)): returns { userId } if token valid and user has role AUTHORISED. */
export async function getAuthorisedFromRequest(
  request: Request
): Promise<{ userId: string } | { error: Response }> {
  const auth = await getUserIdFromRequest(request);
  if ("error" in auth) return auth;
  const user = await prisma.user.findFirst({
    where: { id: auth.userId, deletedAt: null, isActive: true },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "AUTHORISED")
    return { error: NextResponse.json({ error: "Forbidden. Authorised person access required." }, { status: 403 }) };
  return { userId: user.id };
}
