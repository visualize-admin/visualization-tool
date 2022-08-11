import { ReactNode } from "react";
import { createClient, defaultExchanges, Provider } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchange } from "@/graphql/devtools";

const client = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges:
    process.env.NODE_ENV === "development"
      ? [devtoolsExchange, ...defaultExchanges]
      : [...defaultExchanges],
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
