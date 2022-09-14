import { createClient, defaultExchanges } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchanges } from "@/graphql/devtools";

export const client = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges:
    process.env.NODE_ENV === "development"
      ? [...devtoolsExchanges, ...defaultExchanges]
      : [...defaultExchanges],
});
