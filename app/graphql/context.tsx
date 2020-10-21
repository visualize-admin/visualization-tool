import { ReactNode } from "react";
import { createClient, Provider } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";

const client = createClient({
  url: GRAPHQL_ENDPOINT,
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
