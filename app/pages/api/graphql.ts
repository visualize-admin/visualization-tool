import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import "global-agent/bootstrap";
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import depthLimit from "graphql-depth-limit";
import { NextApiRequest, NextApiResponse } from "next";

import { SentryPlugin } from "@/graphql/apollo-sentry-plugin";

import { createContext, VisualizeGraphQLContext } from "../../graphql/context";
import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { runMiddleware } from "../../utils/run-middleware";

// Ability to load graphql responses from Storybook
const corsOrigin = process.env.NODE_ENV === "production" ? undefined : "*";

export const cors = configureCors({
  origin: corsOrigin,
});

const schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
  resolvers,
  schemaTransforms: [constraintDirective()],
});

const server = new ApolloServer({
  schema,
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
  cache: "bounded",
  introspection: true,
  validationRules: [depthLimit(1)],
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground,
    ...(process.env.NODE_ENV === "production" ? [SentryPlugin] : []),
  ],
});

export const config = {
  api: {
    bodyParser: false,
  },
  // see https://vercel.com/docs/functions/configuring-functions/duration
  maxDuration: 60,
};

const start = server.start();

const GraphQLPage = async (req: NextApiRequest, res: NextApiResponse) => {
  await start;
  await runMiddleware(req, res, cors);
  const handler = server.createHandler({ path: "/api/graphql" });
  return handler(req, res);
};

export default GraphQLPage;
