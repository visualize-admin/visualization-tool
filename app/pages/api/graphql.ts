import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import DataLoader from "dataloader";
import "global-agent/bootstrap";
import { GraphQLResolveInfo } from "graphql";
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

const setup = async (
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

export type Loaders = Awaited<ReturnType<typeof setup>>;

const setupContext = async ({
  sourceUrl,
  locale,
}: {
  sourceUrl: string;
  locale: string;
}) => {
  const sparqlClient = new ParsingClient({
    endpointUrl: sourceUrl,
  });
  const sparqlClientStream = new StreamClient({
    endpointUrl: sourceUrl,
  });
  const loaders = await setup(locale, sparqlClient, sparqlClientStream);
  return { loaders, sparqlClient, sparqlClientStream };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(err, err?.extensions?.exception?.stacktrace);
    return err;
  },
  context: async () => {
    const ctx = {} as {
      setupping: Promise<{
        loaders: Loaders | undefined;
        sparqlClient: ParsingClient | undefined;
        sparqlClientStream: StreamClient | undefined;
      }>;
    };

    return {
      setup: async ({
        variableValues: { locale, sourceUrl },
      }: GraphQLResolveInfo) => {
        ctx.setupping = ctx.setupping || setupContext({ locale, sourceUrl });
        return await ctx.setupping;
      },
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
