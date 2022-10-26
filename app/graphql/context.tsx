import DataLoader from "dataloader";
import { GraphQLResolveInfo } from "graphql";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { Awaited } from "@/domain/types";
import { Timings } from "@/gql-flamegraph/resolvers";
import { timed } from "@/utils/timed";

import { createCubeDimensionValuesLoader } from "../rdf/queries";
import {
  createOrganizationLoader,
  createThemeLoader,
} from "../rdf/query-cube-metadata";
import { createGeoCoordinatesLoader } from "../rdf/query-geo-coordinates";
import { createGeoShapesLoader } from "../rdf/query-geo-shapes";

import { RequestQueryMeta } from "./query-meta";

const MAX_BATCH_SIZE = 500;
const createLoaders = async (locale: string, sparqlClient: ParsingClient) => {
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

export type Loaders = Awaited<ReturnType<typeof createLoaders>>;

const createContextContent = async ({
  sourceUrl,
  locale,
  ctx,
}: {
  sourceUrl: string;
  locale: string;
  ctx: GraphQLContext;
}) => {
  const sparqlClient = new ParsingClient({
    endpointUrl: sourceUrl,
  });
  const sparqlClientStream = new StreamClient({
    endpointUrl: sourceUrl,
  });
  const loaders = await createLoaders(locale, sparqlClient);

  sparqlClient.query.select = timed(
    sparqlClient.query.select,
    (t, ...args: Parameters<typeof sparqlClient.query.select>) => {
      ctx.queries.push({
        startTime: t.start,
        endTime: t.end,
        text: args[0],
      });
    }
  );

  return new Proxy(
    { loaders, sparqlClient, sparqlClientStream },
    {
      get(target, prop, receiver) {
        if (prop === "sparqlClient" || prop === "sparqlClientStream") {
          if (!sourceUrl) {
            throw new Error(
              'To use sparqlClient or sparqlClientStream from the GraphQL context, your query must have a "sourceUrl" variable'
            );
          }
        }
        return Reflect.get(target, prop, receiver);
      },
    }
  );
};

export const createContext = () => {
  let setupping: ReturnType<typeof createContextContent>;

  const ctx = {
    // Stores meta information on queries that have been made during the request
    queries: [] as RequestQueryMeta[],
    timings: undefined as Timings | undefined,
    setup: async ({
      variableValues: { locale, sourceUrl },
    }: GraphQLResolveInfo) => {
      setupping = setupping || createContextContent({ locale, sourceUrl, ctx });
      const res = await setupping;
      return res;
    },
  };

  return ctx;
};

export type GraphQLContext = ReturnType<typeof createContext>;
