import { ReactNode } from "react";
import { createClient, Provider } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";
import { defaultLocale } from "../src";

const client = createClient({
  url: GRAPHQL_ENDPOINT,
  fetchOptions: () => {
    const lang =
      typeof document !== "undefined"
        ? document.querySelector("html")?.getAttribute("lang")
        : undefined;
    return {
      headers: {
        "Accept-Language": lang || defaultLocale,
      },
    };
  },
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
