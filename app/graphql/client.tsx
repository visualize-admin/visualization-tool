import { createClient, defaultExchanges } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
import { flag } from "@/flags/flag";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchanges } from "@/graphql/devtools";

const graphqlEndpointFlag = flag("graphql.endpoint");

if (graphqlEndpointFlag) {
  console.log("ℹ️ Using custom GraphQL endpoint:", graphqlEndpointFlag);
}

export const GQL_DEBUG_HEADER = "x-visualize-debug";
export const GQL_CACHE_CONTROL_HEADER = "x-visualize-cache-control";
export const GQL_QUERY_SOURCE_HEADER = "x-visualize-query-source";
export const GQL_QUERY_REASON_HEADER = "x-visualize-query-reason";

export const getGraphqlHeaders = ({
  querySource,
  queryReason,
}: {
  querySource?: string;
  queryReason?: string;
} = {}) => {
  const debug = flag("debug");
  const disableCache = flag("server-side-cache.disable");

  return {
    [GQL_DEBUG_HEADER]: debug ? "true" : "",
    [GQL_CACHE_CONTROL_HEADER]: disableCache ? "no-cache" : "",
    [GQL_QUERY_SOURCE_HEADER]: querySource ?? "",
    [GQL_QUERY_REASON_HEADER]: queryReason ?? "",
  };
};

export const client = createClient({
  url: graphqlEndpointFlag ?? GRAPHQL_ENDPOINT,
  exchanges: [...devtoolsExchanges, ...defaultExchanges],
  fetchOptions: {
    headers: getGraphqlHeaders(),
  },
});
