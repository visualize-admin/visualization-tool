import getConfig from "next/config";

const config = getConfig();

export const PUBLIC_URL = config?.publicRuntimeConfig?.PUBLIC_URL ?? "";
export const SPARQL_ENDPOINT =
  process.env.SPARQL_ENDPOINT ?? "https://int.lindas.admin.ch/query";
export const SPARQL_EDITOR = process.env.SPARQL_EDITOR;
export const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "/api/graphql";
export const GA_TRACKING_ID = config?.publicRuntimeConfig?.GA_TRACKING_ID;
