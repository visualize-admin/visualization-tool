import "isomorphic-unfetch";
import React from "react";
import { Provider, createClient } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";

const client = createClient({
  url: GRAPHQL_ENDPOINT
});

export const GraphqlProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <Provider value={client}>{children}</Provider>;
};
