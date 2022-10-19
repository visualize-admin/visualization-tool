import { devtoolsExchange } from "@urql/devtools";

import { gqlFlamegraphExchange } from "@/gql-flamegraph/devtool";

export const devtoolsExchanges = [gqlFlamegraphExchange, devtoolsExchange];
