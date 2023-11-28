import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";
import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import "global-agent/bootstrap";
import { NextApiRequest, NextApiResponse } from "next";

import { SentryPlugin } from "@/graphql/apollo-sentry-plugin";

import { setupFlamegraph } from "../../gql-flamegraph/resolvers";
import { createContext, VisualizeGraphQLContext } from "../../graphql/context";
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
    const context = reqCtx.context as VisualizeGraphQLContext;

    if (context.debug) {
      response.extensions = {
        queries: context.queries,
        timings: context.timings,
      };
    }

    return response;
  },
  context: createContext,
  introspection: true,
  plugins:
    process.env.NODE_ENV === "production"
      ? [ApolloServerPluginLandingPageGraphQLPlayground, SentryPlugin]
      : [ApolloServerPluginLandingPageGraphQLPlayground],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const start = server.start();

const GraphQLPage = async (req: NextApiRequest, res: NextApiResponse) => {
  await start;
  await runMiddleware(req, res, cors);
  const handler = server.createHandler({ path: "/api/graphql" });
  return handler(req, res);
};

export default GraphQLPage;
