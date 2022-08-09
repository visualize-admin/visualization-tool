import { ReactNode, useCallback } from "react";
import { createClient, defaultExchanges, Provider } from "urql";

import { useDataSource } from "@/components/data-source-menu";
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
  const [dataSource] = useDataSource();

  client.fetchOptions = useCallback(
    () => ({
      headers: {
        "Accept-Language": locale,
        "Data-Source-Type": dataSource.type,
        "Data-Source-URL": dataSource.url,
      },
    }),
    [locale, dataSource]
  );

  return <Provider value={client}>{children}</Provider>;
};
