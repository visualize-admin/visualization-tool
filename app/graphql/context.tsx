import { IncomingMessage } from "http";

import DataLoader from "dataloader";
import { GraphQLResolveInfo } from "graphql";
import rdf from "rdf-ext";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { DimensionValue } from "@/domain/data";
import { SPARQL_GEO_ENDPOINT } from "@/domain/env";
import { Awaited } from "@/domain/types";
import { Timings } from "@/gql-flamegraph/resolvers";
import { ResolvedDimension } from "@/graphql/shared-types";
import { createSource, pragmas } from "@/rdf/create-source";
import { ExtendedCube } from "@/rdf/extended-cube";
import { TimingCallback, timed } from "@/utils/timed";

import { createCubeDimensionValuesLoader } from "../rdf/queries";
import { createGeoCoordinatesLoader } from "../rdf/query-geo-coordinates";
import { createGeoShapesLoader } from "../rdf/query-geo-shapes";

import { RequestQueryMeta } from "./query-meta";

export const MAX_BATCH_SIZE = 500;

export const getRawCube = async (sparqlClient: ParsingClient, iri: string) => {
  const source = createSource(sparqlClient, pragmas);
  const cube = new ExtendedCube({
    parent: source,
    term: rdf.namedNode(iri),
    source,
  });
  // Don't fetch shape yet, as we might need to fetch newer cube.
  await cube.fetchCube();

  return cube;
};

// const cachedGetRawCube = cachedWithTTL(
//   (sourceUrl: string, iri: string) => {
//     console.log("getting cached cube", sourceUrl, iri);
//     return getRawCube(sourceUrl, iri);
//   },
//   (sourceUrl, iri) => `${iri}|${sourceUrl}`,
//   60_000
// );

const createCubeLoader = (sparqlClient: ParsingClient) => {
  return (cubeIris: readonly string[]) => {
    return Promise.all(
      cubeIris.map(async (iri) => {
        return getRawCube(sparqlClient, iri);
      })
    );
  };
};

const createLoaders = async (
  locale: string,
  sparqlClient: ParsingClient,
  geoSparqlClient: ParsingClient,
  cache: LRUCache | undefined
) => {
  return {
    cube: new DataLoader(createCubeLoader(sparqlClient)),
    dimensionValues: new DataLoader(
      createCubeDimensionValuesLoader(sparqlClient, cache),
      {
        cacheKeyFn: (dim) => dim.dimension.path?.value,
      }
    ),
    filteredDimensionValues: new Map<
      string,
      DataLoader<ResolvedDimension, DimensionValue[]>
    >(),
    geoCoordinates: new DataLoader(
      createGeoCoordinatesLoader({ locale, sparqlClient }),
      { maxBatchSize: MAX_BATCH_SIZE * 0.5 }
    ),
    geoShapes: new DataLoader(
      createGeoShapesLoader({ locale, sparqlClient, geoSparqlClient }),
      { maxBatchSize: MAX_BATCH_SIZE * 0.5 }
    ),
  } as const;
};

export type Loaders = Awaited<ReturnType<typeof createLoaders>>;

const setupSparqlClients = (
  ctx: VisualizeGraphQLContext,
  sourceUrl: string
) => {
  const sparqlClient = new ParsingClient({
    endpointUrl: sourceUrl,
  });
  const sparqlClientStream = new StreamClient({
    endpointUrl: sourceUrl,
  });
  const geoSparqlClient = new ParsingClient({
    // Geo endpoint is not stored separately in chart config, so we can use the
    // SPARQL_GEO_ENDPOINT env variable here.
    endpointUrl: SPARQL_GEO_ENDPOINT,
  });

  const saveTimingToContext: TimingCallback = (t, ...args: [string]) => {
    ctx.queries.push({
      startTime: t.start,
      endTime: t.end,
      text: args[0],
    });
  };

  sparqlClient.query.select = timed(
    sparqlClient.query.select,
    saveTimingToContext
  );

  sparqlClient.query.construct = timed(
    sparqlClient.query.construct,
    saveTimingToContext
  );

  sparqlClientStream.query.select = timed(
    sparqlClientStream.query.select,
    saveTimingToContext
  );

  sparqlClientStream.query.construct = timed(
    sparqlClientStream.query.construct,
    saveTimingToContext
  );

  geoSparqlClient.query.select = timed(
    geoSparqlClient.query.select,
    saveTimingToContext
  );

  geoSparqlClient.query.construct = timed(
    geoSparqlClient.query.construct,
    saveTimingToContext
  );

  return { sparqlClient, sparqlClientStream, geoSparqlClient };
};

const sparqlCache = new LRUCache({
  entryExpirationTimeInMS: 60 * 10_000,
  maxSize: 10_000,
});

const shouldUseServerSideCache = (req: IncomingMessage) => {
  return req.headers["x-visualize-cache-control"] !== "no-cache";
};

const isDebugMode = (req: IncomingMessage) => {
  return req.headers["x-visualize-debug"] === "true";
};

const createContextContent = async ({
  sourceUrl,
  locale,
  ctx,
  req,
}: {
  sourceUrl: string;
  locale: string;
  ctx: VisualizeGraphQLContext;
  req: IncomingMessage;
}) => {
  const { sparqlClient, sparqlClientStream, geoSparqlClient } =
    setupSparqlClients(ctx, sourceUrl);
  const contextCache = shouldUseServerSideCache(req) ? sparqlCache : undefined;
  const loaders = await createLoaders(
    locale,
    sparqlClient,
    geoSparqlClient,
    contextCache
  );

  return new Proxy(
    { loaders, sparqlClient, sparqlClientStream, cache: contextCache },
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

export const createContext = ({ req }: { req: IncomingMessage }) => {
  const debug = isDebugMode(req);
  let setupping: ReturnType<typeof createContextContent>;

  const ctx = {
    debug,
    // Stores meta information on queries that have been made during the request
    queries: [] as RequestQueryMeta[],
    timings: undefined as Timings | undefined,
    setup: async ({
      variableValues: { locale, sourceUrl },
    }: GraphQLResolveInfo) => {
      setupping =
        setupping || createContextContent({ locale, sourceUrl, ctx, req });

      return await setupping;
    },
  };

  return ctx;
};

export type VisualizeGraphQLContext = ReturnType<typeof createContext>;
