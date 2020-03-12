import getConfig from "next/config";

const config = getConfig();

export const PUBLIC_URL = config?.publicRuntimeConfig?.PUBLIC_URL ?? "";
export const SPARQL_ENDPOINT =
  config?.publicRuntimeConfig?.SPARQL_ENDPOINT ??
  "https://trifid-lindas.test.cluster.ldbar.ch/query";
export const GRAPHQL_ENDPOINT =
  config?.publicRuntimeConfig?.GRAPHQL_ENDPOINT ?? "/api/graphql";
export const GA_TRACKING_ID = config?.publicRuntimeConfig?.GA_TRACKING_ID;
