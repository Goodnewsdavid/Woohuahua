import { NextResponse } from "next/server";

const allowedOrigin =
  process.env.FRONTEND_URL || "http://localhost:8080";

function corsHeaders(origin?: string | null) {
  const allowOrigin = origin && (origin === "http://localhost:8080" || origin === "http://127.0.0.1:8080")
    ? origin
    : allowedOrigin;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function middleware(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: { ...headers } });
  }

  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
