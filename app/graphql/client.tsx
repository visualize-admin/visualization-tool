import { createClient, defaultExchanges } from "urql";

import { flag } from "@/configurator/components/flag";
import { GRAPHQL_ENDPOINT } from "@/domain/env";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchanges } from "@/graphql/devtools";

export const client = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges: [...devtoolsExchanges, ...defaultExchanges],
  fetchOptions: {
    headers: {
      "x-visualize-cache-control":
        flag("server-side-cache") === false ? "no-cache" : "",
    },
  },
});
