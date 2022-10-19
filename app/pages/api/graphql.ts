import { ApolloServer } from "apollo-server-micro";
import "global-agent/bootstrap";
import configureCors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

import { setupFlamegraph } from "../../gql-flamegraph/resolvers";
import { createContext, GraphQLContext } from "../../graphql/context";
import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { runMiddleware } from "../../utils/run-middleware";

export const cors = configureCors();

setupFlamegraph(resolvers);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  formatResponse: (response, reqCtx) => {
    const context = reqCtx.context as GraphQLContext;
    response.extensions = {
      queries: context.queries,
      timings: context.timings,
    };
    return response;
  },
  context: createContext,
  // Enable playground in production
  introspection: true,
  playground: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = server.createHandler({ path: "/api/graphql" });

const GraphQLPage = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);
  return handler(req, res);
};

export default GraphQLPage;
