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
import { getMaybeCachedSparqlUrl } from "@/graphql/caching-utils";
import { RequestQueryMeta } from "@/graphql/query-meta";
import {
  QueryResolvers,
  Resolver,
  ResolversObject,
} from "@/graphql/resolver-types";
import { ResolvedDimension } from "@/graphql/shared-types";
import { createSource, pragmas } from "@/rdf/create-source";
import { ExtendedCube } from "@/rdf/extended-cube";
import { createCubeDimensionValuesLoader } from "@/rdf/queries";
import { createGeoShapesLoader } from "@/rdf/query-geo-shapes";
import { tracer } from "@/tracer";
import { timed, TimingCallback } from "@/utils/timed";

export const MAX_BATCH_SIZE = 500;

const getRawCube = async (sparqlClient: ParsingClient, iri: string) => {
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
    geoShapes: new DataLoader(createGeoShapesLoader({ geoSparqlClient }), {
      maxBatchSize: MAX_BATCH_SIZE * 0.5,
    }),
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

  const originalSparqlClientQuerySelect = sparqlClient.query.select;
  sparqlClient.query.select = timed(function (
    this: typeof sparqlClient.query,
    query,
    ...args
  ) {
    return tracer.startActiveSpan("sparqlClient.query.select", async (span) => {
      try {
        span.setAttribute("db.sparql.has_query_event", true);
        span.addEvent("sparql.query", {
          "db.query.text": query,
          "db.system.name": "sparql",
        });
        return await originalSparqlClientQuerySelect.call(this, query, ...args);
      } finally {
        span.end();
      }
    });
  }, saveTimingToContext);

  const originalSparqlClientQueryConstruct = sparqlClient.query.construct;
  sparqlClient.query.construct = timed(function (
    this: typeof sparqlClient.query,
    query,
    ...args
  ) {
    return tracer.startActiveSpan(
      "sparqlClient.query.construct",
      async (span) => {
        try {
          span.setAttribute("db.sparql.has_query_event", true);
          span.addEvent("sparql.query", {
            "db.query.text": query,
            "db.system.name": "sparql",
          });
          return await originalSparqlClientQueryConstruct.call(
            this,
            query,
            ...args
          );
        } finally {
          span.end();
        }
      }
    );
  }, saveTimingToContext);

  const originalSparqlClientStreamQuerySelect = sparqlClientStream.query.select;
  sparqlClientStream.query.select = timed(function (
    this: typeof sparqlClientStream.query,
    query,
    ...args
  ) {
    return tracer.startActiveSpan(
      "sparqlClientStream.query.select",
      async (span) => {
        try {
          span.setAttribute("db.sparql.has_query_event", true);
          span.addEvent("sparql.query", {
            "db.query.text": query,
            "db.system.name": "sparql",
          });
          return await originalSparqlClientStreamQuerySelect.call(
            this,
            query,
            ...args
          );
        } finally {
          span.end();
        }
      }
    );
  }, saveTimingToContext);

  const originalSparqlClientStreamQueryConstruct =
    sparqlClientStream.query.construct;
  sparqlClientStream.query.construct = timed(function (
    this: typeof sparqlClientStream.query,
    query,
    ...args
  ) {
    return tracer.startActiveSpan(
      "sparqlClientStream.query.construct",
      async (span) => {
        try {
          span.setAttribute("db.sparql.has_query_event", true);
          span.addEvent("sparql.query", {
            "db.query.text": query,
            "db.system.name": "sparql",
          });
          return await originalSparqlClientStreamQueryConstruct.call(
            this,
            query,
            ...args
          );
        } finally {
          span.end();
        }
      }
    );
  }, saveTimingToContext);

  const originalGeoSparqlClientQuerySelect = geoSparqlClient.query.select;
  geoSparqlClient.query.select = timed(function (
    this: typeof geoSparqlClient.query,
    query,
    ...args
  ) {
    return tracer.startActiveSpan(
      "geoSparqlClient.query.select",
      async (span) => {
        try {
          span.setAttribute("db.sparql.has_query_event", true);
          span.addEvent("sparql.query", {
            "db.query.text": query,
            "db.system.name": "sparql",
          });
          return await originalGeoSparqlClientQuerySelect.call(
            this,
            query,
            ...args
          );
        } finally {
          span.end();
        }
      }
    );
  }, saveTimingToContext);

  const originalGeoSparqlClientQueryConstruct = geoSparqlClient.query.construct;
  geoSparqlClient.query.construct = timed(function (
    this: typeof geoSparqlClient.query,
    query,
    ...args
  ) {
    return tracer.startActiveSpan(
      "geoSparqlClient.query.construct",
      async (span) => {
        try {
          span.setAttribute("db.sparql.has_query_event", true);
          span.addEvent("sparql.query", {
            "db.query.text": query,
            "db.system.name": "sparql",
          });
          return await originalGeoSparqlClientQueryConstruct.call(
            this,
            query,
            ...args
          );
        } finally {
          span.end();
        }
      }
    );
  }, saveTimingToContext);

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
  ctx,
  req,
}: {
  sourceUrl: string;
  ctx: VisualizeGraphQLContext;
  req: IncomingMessage;
}) => {
  const { sparqlClient, sparqlClientStream, geoSparqlClient } =
    setupSparqlClients(ctx, sourceUrl);
  const contextCache = shouldUseServerSideCache(req) ? sparqlCache : undefined;
  const loaders = await createLoaders(
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
            throw Error(
              'To use sparqlClient or sparqlClientStream from the GraphQL context, your query must have a "sourceUrl" variable'
            );
          }
        }
        return Reflect.get(target, prop, receiver);
      },
    }
  );
};

type ExtractResolversObject<O> = O extends ResolversObject<infer S> ? S : never;
type Resolvers = ExtractResolversObject<QueryResolvers>;
type ExtractResolver<O> =
  O extends Resolver<any, any, any, infer S> ? S : never;
type VariableValues = ExtractResolver<Resolvers[keyof Resolvers]>;

export const createContext = ({ req }: { req: IncomingMessage }) => {
  const debug = isDebugMode(req);
  let settingUp: ReturnType<typeof createContextContent>;

  const ctx = {
    debug,
    // Stores meta information on queries that have been made during the request
    queries: [] as RequestQueryMeta[],
    timings: undefined as Timings | undefined,
    setup: async (props: GraphQLResolveInfo) => {
      const variableValues = props.variableValues as VariableValues;
      const { sourceUrl } = variableValues;
      settingUp =
        settingUp ||
        createContextContent({
          sourceUrl: getMaybeCachedSparqlUrl({
            endpointUrl: sourceUrl,
            cubeIri:
              "cubeFilter" in variableValues
                ? variableValues.cubeFilter.iri
                : undefined,
          }),
          ctx,
          req,
        });
      return await settingUp;
    },
  };

  return ctx;
};

export type VisualizeGraphQLContext = ReturnType<typeof createContext>;
