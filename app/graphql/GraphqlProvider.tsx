import { ReactNode } from "react";
import { Provider } from "urql";

import { client } from "./client";

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
