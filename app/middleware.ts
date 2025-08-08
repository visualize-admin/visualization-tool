import { NextRequest, NextResponse } from "next/server";

export const config = {
  // We need to whitelist some paths that we want to be able to access from
  // sandboxed iframes from admin.ch.
  matcher: ["/embed/:path*", "/api/graphql"],
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isNullOrigin = !origin || origin === "null";

  const response = NextResponse.next();

  if ((origin && origin.endsWith(".admin.ch")) || isNullOrigin) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      isNullOrigin ? "null" : origin
    );
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}
