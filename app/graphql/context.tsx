import { ReactNode } from "react";
import { createClient, Provider } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";
import { useLocale } from "../src";

const client = createClient({ url: GRAPHQL_ENDPOINT });

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  client.fetchOptions = () => ({
    headers: { "Accept-Language": locale },
  });

  return <Provider value={client}>{children}</Provider>;
};
