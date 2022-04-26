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
import { createGeoCoordinatesLoader } from "../../rdf/query-geo-coordinates";
import { createGeoShapesLoader } from "../../rdf/query-geo-shapes";

const MAX_BATCH_SIZE = 500;

const cors = configureCors();

const makeLoaders = (req: any) => {
  return {
    dimensionValues: new DataLoader(createCubeDimensionValuesLoader(), {
      cacheKeyFn: (dim) => dim.dimension.path?.value,
    }),
    filteredDimensionValues: new Map<string, DataLoader<unknown, unknown>>(),
    geoCoordinates: new DataLoader(
      createGeoCoordinatesLoader({ locale: req.headers["accept-language"] }),
      {
        maxBatchSize: MAX_BATCH_SIZE * 0.5,
      }
    ),
    geoShapes: new DataLoader(
      createGeoShapesLoader({ locale: req.headers["accept-language"] }),
      { maxBatchSize: MAX_BATCH_SIZE }
    ),
    themes: new DataLoader(
      createThemeLoader({ locale: req.headers["accept-language"] })
    ),
    organizations: new DataLoader(
      createOrganizationLoader({ locale: req.headers["accept-language"] })
    ),
  } as const;
};

export type Loaders = ReturnType<typeof makeLoaders>;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  context: ({ req }) => ({
    loaders: makeLoaders(req),
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
