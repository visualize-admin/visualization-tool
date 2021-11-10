declare global {
  interface Window {
    __runtimeEnv__: Record<string, string | undefined>;
  }
}

const runtimeEnv =
  typeof window !== "undefined" ? window.__runtimeEnv__ : undefined;

// These values are exposed in pages/_document.tsx to the browser or read from process.env on the server-side.
// Note: we can't destructure process.env because it's mangled in the Next.js runtime

export const PUBLIC_URL = (
  runtimeEnv?.PUBLIC_URL ??
  process.env.PUBLIC_URL ??
  ""
).replace(/\/$/, "");

export const SPARQL_ENDPOINT =
  runtimeEnv?.SPARQL_ENDPOINT ??
  process.env.SPARQL_ENDPOINT ??
  "https://int.lindas.admin.ch/query";

export const SPARQL_EDITOR =
  runtimeEnv?.SPARQL_EDITOR ?? process.env.SPARQL_EDITOR;

export const GRAPHQL_ENDPOINT =
  runtimeEnv?.GRAPHQL_ENDPOINT ??
  process.env.GRAPHQL_ENDPOINT ??
  "/api/graphql";

export const GA_TRACKING_ID =
  runtimeEnv?.GA_TRACKING_ID ?? process.env.GA_TRACKING_ID;

// Server-side-only values (not exposed through window)

export const DATABASE_URL = process.env.DATABASE_URL;

// Build-time env vars

export const VERSION = process.env.NEXT_PUBLIC_VERSION;
export const COMMIT = process.env.NEXT_PUBLIC_COMMIT;
export const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
