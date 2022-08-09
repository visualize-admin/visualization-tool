import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import DataLoader from "dataloader";
import "global-agent/bootstrap";
import { NextApiRequest, NextApiResponse } from "next";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { Awaited } from "@/domain/types";

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

export const setup = async (req: any) => {
  const locale = req.headers["accept-language"];
  const sparqlClient = new ParsingClient({
    endpointUrl: req.headers["data-source-url"],
  });
  const sparqlClientStream = new StreamClient({
    endpointUrl: req.headers["data-source-url"],
  });

  return {
    loaders: {
      dimensionValues: new DataLoader(
        createCubeDimensionValuesLoader(sparqlClient),
        {
          cacheKeyFn: (dim) => dim.dimension.path?.value,
        }
      ),
      filteredDimensionValues: new Map<string, DataLoader<unknown, unknown>>(),
      geoCoordinates: new DataLoader(
        createGeoCoordinatesLoader({ locale, sparqlClient }),
        { maxBatchSize: MAX_BATCH_SIZE * 0.5 }
      ),
      geoShapes: new DataLoader(
        createGeoShapesLoader({ locale, sparqlClient }),
        {
          maxBatchSize: MAX_BATCH_SIZE,
        }
      ),
      themes: new DataLoader(createThemeLoader({ locale, sparqlClient })),
      organizations: new DataLoader(
        createOrganizationLoader({ locale, sparqlClient })
      ),
    },
    sparqlClient,
    sparqlClientStream,
  } as const;
};

export type Loaders = Awaited<ReturnType<typeof setup>>["loaders"];

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  context: async ({ req }) => {
    const { loaders, sparqlClient, sparqlClientStream } = await setup(req);
    return { loaders, sparqlClient, sparqlClientStream };
  },
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
