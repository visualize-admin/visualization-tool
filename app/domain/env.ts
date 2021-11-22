declare global {
  interface Window {
    __clientEnv__: Record<string, string | undefined>;
  }
}

/**
 * Client and server-side **RUNTIME** variables
 *
 * These values are exposed in pages/_document.tsx to the browser or read from process.env on the server-side.
 * Note: we can't destructure process.env because it's mangled in the Next.js runtime
 */

const clientEnv =
  typeof window !== "undefined" ? window.__clientEnv__ : undefined;

export const PUBLIC_URL = (
  clientEnv?.PUBLIC_URL ??
  process.env.PUBLIC_URL ??
  ""
).replace(/\/$/, "");

// export const SPARQL_ENDPOINT =
//   clientEnv?.SPARQL_ENDPOINT ??
//   process.env.SPARQL_ENDPOINT ??
//   "https://int.lindas.admin.ch/query";

export const SPARQL_ENDPOINT = "https://int.lindas.admin.ch/query";

export const SPARQL_EDITOR =
  clientEnv?.SPARQL_EDITOR ?? process.env.SPARQL_EDITOR;

export const GRAPHQL_ENDPOINT =
  clientEnv?.GRAPHQL_ENDPOINT ?? process.env.GRAPHQL_ENDPOINT ?? "/api/graphql";

export const GA_TRACKING_ID =
  clientEnv?.GA_TRACKING_ID ?? process.env.GA_TRACKING_ID;

/**
 * Server-side-only **RUNTIME** variables (not exposed through window)
 */

export const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Variables set at **BUILD TIME** through `NEXT_PUBLIC_*` variables. Available on the client and server.
 */

export const BUILD_VERSION = process.env.NEXT_PUBLIC_VERSION;
export const BUILD_COMMIT = process.env.NEXT_PUBLIC_COMMIT;
export const BUILD_GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
