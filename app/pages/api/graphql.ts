import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import DataLoader from "dataloader";
import "global-agent/bootstrap";
import { GraphQLResolveInfo } from "graphql";
import { NextApiRequest, NextApiResponse } from "next";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

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

export const makeLoaders = async (
  locale: string,
  sparqlClient: ParsingClient
) => {
  return {
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
    geoShapes: new DataLoader(createGeoShapesLoader({ locale, sparqlClient }), {
      maxBatchSize: MAX_BATCH_SIZE,
    }),
    themes: new DataLoader(createThemeLoader({ locale, sparqlClient })),
    organizations: new DataLoader(
      createOrganizationLoader({ locale, sparqlClient })
    ),
  } as const;
};

export type Loaders = Awaited<ReturnType<typeof makeLoaders>>;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  // Initialized in resolvers
  context: function () {
    const context = this as {
      setup: (info: GraphQLResolveInfo) => {
        loaders: Loaders;
        sparqlClient: ParsingClient;
        sparqlClientStream: StreamClient;
      };
      loaders: Loaders | undefined;
      sparqlClient: ParsingClient | undefined;
      sparqlClientStream: StreamClient | undefined;
    };

    return {
      setup: async ({ variableValues }: GraphQLResolveInfo) => {
        const { locale, sourceUrl } = variableValues;

        if (
          context.loaders === undefined &&
          context.sparqlClient === undefined &&
          context.sparqlClientStream === undefined
        ) {
          context.sparqlClient = new ParsingClient({
            endpointUrl: sourceUrl,
          });
          context.sparqlClientStream = new StreamClient({
            endpointUrl: sourceUrl,
          });
          context.loaders = await makeLoaders(locale, context.sparqlClient);
        }

        return {
          loaders: context.loaders,
          sparqlClient: context.sparqlClient,
          sparqlClientStream: context.sparqlClientStream,
        };
      },
      loaders: undefined,
      sparqlClient: undefined,
    };
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
