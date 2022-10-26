import { createClient, defaultExchanges } from "urql";

import { GRAPHQL_ENDPOINT } from "./domain/env";

// @ts-ignore Ignoring cannot be compiled as isolated module warning. It's working.
jest.mock("@lingui/macro", () => {
  return {
    // Since it's a macro, it's not defined at runtime, maybe in the future
    // we should add a transformer so that jest files are transformed the same
    // way as app files so that the macro is defined inside files that are ran by Jest.
    defineMessage: (x: string) => x,
  };
});

jest.mock("@/graphql/client", () => {
  return {
    client: createClient({
      url: GRAPHQL_ENDPOINT,
      exchanges: [...defaultExchanges],
    }),
  };
});
