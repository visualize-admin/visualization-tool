import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import "global-agent/bootstrap";
import { NextApiRequest, NextApiResponse } from "next";
import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { runMiddleware } from "../../lib/run-middleware";

const cors = configureCors();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Enable playground in production
  introspection: true,
  playground: true
});

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = server.createHandler({ path: "/api/graphql" });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);
  return handler(req, res);
};
