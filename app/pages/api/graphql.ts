import "global-agent/bootstrap";
import { ApolloServer } from "apollo-server-micro";
import cors from "micro-cors";
import typeDefs from "../../graphql/schema.graphql";
import { resolvers } from "../../graphql/resolvers";

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

export default cors()((req, res) =>
  req.method === "OPTIONS" ? res.end() : handler(req, res)
);
