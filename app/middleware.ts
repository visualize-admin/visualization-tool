import { NextRequest, NextResponse } from "next/server";

export const config = {
  // We need to whitelist some paths that we want to be able to access from
  // sandboxed iframes from admin.ch.
  matcher: ["/embed/:path*", "/api/graphql"],
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isNullOrigin = origin === "null" || origin === "";

  const allowed = origin.endsWith(".admin.ch") || isNullOrigin;

  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (allowed) {
      res.headers.set(
        "Access-Control-Allow-Origin",
        isNullOrigin ? "null" : origin
      );
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    }
    return res;
  }

  const res = NextResponse.next();
  if (allowed) {
    res.headers.set(
      "Access-Control-Allow-Origin",
      isNullOrigin ? "null" : origin
    );
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }
  return res;
}
