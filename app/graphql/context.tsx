import { ReactNode, useCallback } from "react";
import { createClient, defaultExchanges, Provider } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchange } from "@/graphql/devtools";
import { useLocale } from "@/src";

const client = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges:
    process.env.NODE_ENV === "development"
      ? [devtoolsExchange, ...defaultExchanges]
      : [...defaultExchanges],
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  client.fetchOptions = useCallback(
    () => ({ headers: { "Accept-Language": locale } }),
    [locale]
  );

  return <Provider value={client}>{children}</Provider>;
};
