import DataLoader from "dataloader";
import { GraphQLResolveInfo } from "graphql";
import { ReactNode } from "react";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";
import { createClient, defaultExchanges, Provider } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
import { Awaited } from "@/domain/types";
// @ts-ignore - dynamic package import based on NODE_ENV
import { devtoolsExchange } from "@/graphql/devtools";

import { createCubeDimensionValuesLoader } from "../rdf/queries";
import {
  createOrganizationLoader,
  createThemeLoader,
} from "../rdf/query-cube-metadata";
import { createGeoCoordinatesLoader } from "../rdf/query-geo-coordinates";
import { createGeoShapesLoader } from "../rdf/query-geo-shapes";

const client = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges:
    process.env.NODE_ENV === "development"
      ? [devtoolsExchange, ...defaultExchanges]
      : [...defaultExchanges],
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};

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
  const loaders = await createLoaders(locale, sparqlClient);
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

    setup: async ({
      variableValues: { locale, sourceUrl },
    }: GraphQLResolveInfo) => {
      setupping = setupping || createContextContent({ locale, sourceUrl });
      return await setupping;
    },
  };

  return ctx;
};

export type GraphQLContext = ReturnType<typeof createContext>;
