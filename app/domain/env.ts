import { isRunningInBrowser } from "@/utils/is-running-in-browser";

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

const clientEnv = isRunningInBrowser() ? window.__clientEnv__ : undefined;

export const PUBLIC_URL = (
  clientEnv?.PUBLIC_URL ??
  process.env.PUBLIC_URL ??
  ""
).replace(/\/$/, "");

export const ENDPOINT =
  clientEnv?.ENDPOINT ??
  process.env.ENDPOINT ??
  "sparql+https://lindas-cached.cluster.ldbar.ch/query";

export const WHITELISTED_DATA_SOURCES = clientEnv?.WHITELISTED_DATA_SOURCES ??
  (process.env.WHITELISTED_DATA_SOURCES !== undefined
    ? JSON.parse(process.env.WHITELISTED_DATA_SOURCES)
    : undefined) ?? ["Prod"];

export const SPARQL_GEO_ENDPOINT =
  clientEnv?.SPARQL_GEO_ENDPOINT ??
  process.env.SPARQL_GEO_ENDPOINT ??
  "https://geo.ld.admin.ch/query";

export const SQL_ENDPOINT =
  clientEnv?.SQL_ENDPOINT ?? process.env.SQL_ENDPOINT ?? "";

export const GRAPHQL_ENDPOINT =
  clientEnv?.GRAPHQL_ENDPOINT ?? process.env.GRAPHQL_ENDPOINT ?? "/api/graphql";

export const GA_TRACKING_ID =
  clientEnv?.GA_TRACKING_ID ?? process.env.GA_TRACKING_ID;

export const ADFS_PROFILE_URL =
  clientEnv?.ADFS_PROFILE_URL ?? process.env.ADFS_PROFILE_URL;

/**
 * Server-side-only **RUNTIME** variables (not exposed through window)
 */

export const PREVENT_SEARCH_BOTS = process.env.PREVENT_SEARCH_BOTS === "true";
export const DATABASE_URL = process.env.DATABASE_URL;
export const ADFS_ID = process.env.ADFS_ID;
export const ADFS_ISSUER = process.env.ADFS_ISSUER;

/**
 * Variables set at **BUILD TIME** through `NEXT_PUBLIC_*` variables. Available on the client and server.
 */

export const BUILD_VERSION = process.env.NEXT_PUBLIC_VERSION;
export const BUILD_COMMIT = process.env.NEXT_PUBLIC_COMMIT;
export const BUILD_GITHUB_REPO = (
  process.env.NEXT_PUBLIC_GITHUB_REPO || ""
).replace(/^git\+https/, "https"); // Don't use git+https for the link, need to check with Abraxas
export const BASE_VECTOR_TILE_URL =
  process.env.NEXT_PUBLIC_BASE_VECTOR_TILE_URL ?? "";
export const MAPTILER_STYLE_KEY =
  process.env.NEXT_PUBLIC_MAPTILER_STYLE_KEY ?? "";
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://1783a12ef4c64b678167ea8761265825@o65222.ingest.sentry.io/4504922724040704";
export const SENTRY_ENV = process.env.NEXT_PUBLIC_SENTRY_ENV;
