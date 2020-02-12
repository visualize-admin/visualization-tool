import "isomorphic-unfetch";
import React from "react";
import { Provider, createClient } from "urql";

const client = createClient({
  url: "/api/graphql"
});

export const GraphqlProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <Provider value={client}>{children}</Provider>;
};
