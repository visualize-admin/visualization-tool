import { createClient, defaultExchanges } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
import { flag } from "@/flags/flag";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchanges } from "@/graphql/devtools";

const graphqlEndpointFlag = flag("graphql.endpoint");

if (graphqlEndpointFlag) {
  console.log("ℹ️ Using custom GraphQL endpoint:", graphqlEndpointFlag);
}

export const client = createClient({
  url:
    typeof graphqlEndpointFlag === "string"
      ? graphqlEndpointFlag
      : GRAPHQL_ENDPOINT,
  exchanges: [...devtoolsExchanges, ...defaultExchanges],
  fetchOptions: {
    headers: getHeaders(),
  },
});

function getHeaders() {
  const debug = flag("debug");
  const disableCache = flag("server-side-cache.disable");

  return {
    "x-visualize-debug": debug ? "true" : "",
    "x-visualize-cache-control": disableCache ? "no-cache" : "",
  };
}
