import { ApolloServer } from "apollo-server-micro";
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

export default server.createHandler({ path: "/api/graphql" });
