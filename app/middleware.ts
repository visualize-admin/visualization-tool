import { NextRequest, NextResponse } from "next/server";

const EMBEDDABLE_PATH_PATTERNS = [
  /^\/embed\//,
  /^\/preview$/,
  /^\/api\/embed-aem-ext\//,
];

function buildCSP(frameAncestors: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const isVercel = !!process.env.VERCEL;
  const sentryCSP = process.env.SENTRY_CSP ? ` ${process.env.SENTRY_CSP}` : "";
  const unsafeEval = isDev ? " 'unsafe-eval'" : "";
  const vercelDefault = isVercel
    ? " https://vercel.live/ https://vercel.com"
    : "";
  const vercelScript = isVercel
    ? " https://vercel.live/ https://vercel.com"
    : "";
  const vercelScriptElem = isVercel
    ? " https://vercel.live https://vercel.com https://*.vercel.app"
    : "";
  const vercelWorker = isVercel ? " https://*.vercel.app" : "";

  return [
    `default-src 'self' 'unsafe-inline'${unsafeEval}${sentryCSP}${vercelDefault}`,
    `script-src 'self' 'unsafe-inline'${unsafeEval}${sentryCSP}${vercelScript} https://api.mapbox.com https://api.maptiler.com`,
    `script-src-elem 'self' 'unsafe-inline' https://*.admin.ch https://visualize.admin.ch https://*.visualize.admin.ch${vercelScriptElem} https://api.mapbox.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self'`,
    `img-src 'self' * data: blob:`,
    `connect-src 'self' *`,
    `worker-src 'self' blob: https://*.admin.ch${vercelWorker}`,
    `form-action 'self'`,
    `frame-ancestors ${frameAncestors}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export function middleware(request: NextRequest) {
  // Static headers are set in next.config.js.
  // This middleware is adding some dynamic headers that depends on environment variables and request path.

  const { pathname } = request.nextUrl;
  const isEmbeddable = EMBEDDABLE_PATH_PATTERNS.some((p) => p.test(pathname));
  const frameAncestors = isEmbeddable ? "*" : "'self'";

  const reportOnly = process.env.CSP_REPORT_ONLY === "true";
  const cspKey = reportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

  const response = NextResponse.next();
  response.headers.set(cspKey, buildCSP(frameAncestors));

  if (process.env.PREVENT_SEARCH_BOTS === "true") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon\\.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
