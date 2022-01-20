import { ReactNode, useCallback } from "react";
import { createClient, Provider } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";
import { useLocale } from "../src";

const client = createClient({ url: GRAPHQL_ENDPOINT });

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  client.fetchOptions = useCallback(
    () => ({ headers: { "Accept-Language": locale } }),
    [locale]
  );

  return <Provider value={client}>{children}</Provider>;
};
