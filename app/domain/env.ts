import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const PUBLIC_URL = publicRuntimeConfig.PUBLIC_URL;
export const SPARQL_ENDPOINT = publicRuntimeConfig.SPARQL_ENDPOINT;
export const GA_TRACKING_ID = publicRuntimeConfig.GA_TRACKING_ID;
