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

const setup = (
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient
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

export type Loaders = ReturnType<typeof setup>;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  context: function () {
    const context = this as {
      loaders: Loaders | undefined;
      sparqlClient: ParsingClient | undefined;
      sparqlClientStream: StreamClient | undefined;
    };
    // Why this isn't cleared with each request?
    context.loaders = undefined;
    context.sparqlClient = undefined;
    context.sparqlClientStream = undefined;

    return {
      setup: ({
        variableValues: { locale, sourceUrl },
      }: GraphQLResolveInfo) => {
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
          context.loaders = setup(
            locale,
            context.sparqlClient,
            context.sparqlClientStream
          );
        }

        return context;
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
