import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import DataLoader from "dataloader";
import "global-agent/bootstrap";
import { NextApiRequest, NextApiResponse } from "next";
import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { runMiddleware } from "../../lib/run-middleware";
import { createCubeDimensionValuesLoader } from "../../rdf/queries";
import {
  createOrganizationLoader,
  createThemeLoader,
} from "../../rdf/query-cube-metadata";

const cors = configureCors();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  context: ({ req }) => ({
    loaders: {
      dimensionValues: new DataLoader(createCubeDimensionValuesLoader(), {
        cacheKeyFn: (dim) => dim.dimension.path?.value,
      }),
      themes: new DataLoader(
        createThemeLoader({ locale: req.headers["accept-language"] })
      ),
      organizations: new DataLoader(
        createOrganizationLoader({ locale: req.headers["accept-language"] })
      ),
    },
  }),
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
