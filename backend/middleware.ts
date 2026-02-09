import { NextResponse } from "next/server";

const defaultFrontendUrl = "http://localhost:8080";
const allowedFrontendUrl = (process.env.FRONTEND_URL || defaultFrontendUrl).replace(/\/$/, "");

function corsHeaders(origin?: string | null) {
  const allowedOrigins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    allowedFrontendUrl,
  ];
  const allowOrigin =
    origin && allowedOrigins.some((o) => origin === o || origin === o + "/")
      ? origin.replace(/\/$/, "")
      : allowedFrontendUrl;
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
