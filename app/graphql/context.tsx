import { ReactNode, useCallback } from "react";
import { createClient, defaultExchanges, Provider } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";
import { useLocale } from "../src";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchange } from "./devtools";

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
