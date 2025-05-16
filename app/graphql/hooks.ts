import { useCallback, useEffect, useMemo, useState } from "react";
import { Client, useClient } from "urql";

import {
  ChartConfig,
  ConfiguratorState,
  hasChartConfigs,
} from "@/configurator";
import {
  DataCubeComponents,
  DataCubeMetadata,
  DataCubesObservations,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { Locale } from "@/locales/locales";
import { assert } from "@/utils/assert";

import { joinDimensions, mergeObservations } from "./join";
import {
  DataCubeComponentFilter,
  DataCubeComponentsDocument,
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
  DataCubeComponentTermsetsDocument,
  DataCubeComponentTermsetsQuery,
  DataCubeComponentTermsetsQueryVariables,
  DataCubeMetadataDocument,
  DataCubeMetadataFilter,
  DataCubeMetadataQuery,
  DataCubeMetadataQueryVariables,
  DataCubeObservationFilter,
  DataCubeObservationsDocument,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
} from "./query-hooks";

const useQueryKey = (options: object) => {
  return useMemo(() => {
    return JSON.stringify(options);
  }, [options]);
};

export const makeUseQuery =
  <
    T extends {
      variables: object;
      pause?: boolean;
    },
    V,
  >({
    fetch,
    check,
    transform,
  }: {
    check?: (variables: T["variables"]) => void;
    fetch: (
      client: Client,
      options: T["variables"],
      onFetching?: () => void
    ) => Promise<{
      data?: V;
      error?: Error;
      fetching: boolean;
    }>;
    transform?: (
      data: { data?: V | null; error?: Error; fetching: boolean },
      options: T
    ) => { data?: V | null; error?: Error; fetching: boolean };
  }) =>
  (options: T & { keepPreviousData?: boolean }) => {
    const client = useClient();
    const [rawResult, setRawResult] = useState<{
      queryKey: string | null;
      data?: V | null;
      error?: Error;
      fetching: boolean;
    }>({ fetching: !options.pause, queryKey: null, data: null });
    const { keepPreviousData } = options;
    const queryKey = useQueryKey(options);

    if (!options.pause && check) {
      check(options.variables);
    }

    const executeQuery = useCallback(
      async (options: { variables: T["variables"] }) => {
        setRawResult((prev) => ({
          ...prev,
          fetching: false,
          data:
            prev.queryKey === queryKey || keepPreviousData ? prev.data : null,
          queryKey,
        }));
        if (check) {
          check(options.variables);
        }
        const result = await fetch(client, options.variables, () => {
          setRawResult((prev) => ({
            ...prev,
            fetching: true,
          }));
        });
        setRawResult({ ...result, queryKey });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [queryKey]
    );

    useEffect(() => {
      if (options.pause) {
        return;
      }

      executeQuery(options);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey, options.pause]);

    const result = useMemo(() => {
      if (!transform) {
        return rawResult;
      }

      return transform(rawResult, options);
    }, [rawResult, options]);

    return [result, executeQuery] as const;
  };

type DataCubesMetadataOptions = {
  variables: Omit<DataCubeMetadataQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeMetadataFilter[];
  };
  pause?: boolean;
};

type DataCubesMetadataData = {
  dataCubesMetadata: DataCubeMetadata[];
};

const executeDataCubesMetadataQuery = async (
  client: Client,
  variables: DataCubesMetadataOptions["variables"],
  /** Callback triggered when data fetching starts (cache miss). */
  onFetching?: () => void
) => {
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;

  const queries = await Promise.all(
    cubeFilters.map((cubeFilter) => {
      const cubeVariables = { locale, sourceType, sourceUrl, cubeFilter };
      const cached = client.readQuery<
        DataCubeMetadataQuery,
        DataCubeMetadataQueryVariables
      >(DataCubeMetadataDocument, cubeVariables);

      if (cached) {
        return Promise.resolve(cached);
      }

      onFetching?.();

      return client
        .query<
          DataCubeMetadataQuery,
          DataCubeMetadataQueryVariables
        >(DataCubeMetadataDocument, cubeVariables)
        .toPromise();
    })
  );
  const error = queries.find((q) => q.error)?.error;
  const fetching = !error && queries.some((q) => !q.data);

  return {
    data:
      error || fetching
        ? undefined
        : { dataCubesMetadata: queries.map((q) => q.data!.dataCubeMetadata) },
    error,
    fetching,
  };
};

export const useDataCubesMetadataQuery = makeUseQuery<
  DataCubesMetadataOptions,
  DataCubesMetadataData
>({
  fetch: executeDataCubesMetadataQuery,
});

export type DataCubesComponentsOptions = {
  variables: Omit<DataCubeComponentsQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeComponentFilter[];
  };
  pause?: boolean;
};

type DataCubesComponentsData = {
  dataCubesComponents: DataCubeComponents;
};

export const executeDataCubesComponentsQuery = async (
  client: Client,
  variables: DataCubesComponentsOptions["variables"],
  /** Callback triggered when data fetching starts (cache miss). */
  onFetching?: () => void
) => {
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;
  const joinBy = Object.fromEntries(
    cubeFilters
      .map((x) => {
        return [x.iri, x.joinBy];
      })
      .filter(truthy)
  );
  const queries = await Promise.all(
    cubeFilters.map((cubeFilter) => {
      const cubeVariables = {
        locale,
        sourceType,
        sourceUrl,
        cubeFilter,
      };

      const cached = client.readQuery<
        DataCubeComponentsQuery,
        DataCubeComponentsQueryVariables
      >(DataCubeComponentsDocument, cubeVariables);

      if (cached) {
        return Promise.resolve(cached);
      }

      onFetching?.();

      return client
        .query<
          DataCubeComponentsQuery,
          DataCubeComponentsQueryVariables
        >(DataCubeComponentsDocument, cubeVariables)
        .toPromise();
    })
  );

  const error = queries.find((q) => q.error)?.error;
  const fetching = !error && queries.some((q) => !q.data);

  if (error || fetching) {
    return {
      data: undefined,
      error,
      fetching,
    };
  }

  const { dimensions: firstDimensions = [], measures: firstMeasures = [] } =
    queries[0].data?.dataCubeComponents || {};
  assert(firstDimensions !== undefined, "Undefined dimensions");
  assert(firstMeasures !== undefined, "Undefined measures");

  return {
    data:
      queries.length === 1
        ? {
            dataCubesComponents: {
              dimensions: firstDimensions,
              measures: firstMeasures,
            },
          }
        : {
            dataCubesComponents: {
              dimensions: joinDimensions({
                joinBy,
                dimensions: queries
                  .map((q) => {
                    const dataCubeComponents = q.data?.dataCubeComponents;
                    assert(
                      dataCubeComponents !== undefined,
                      "Undefined dataCubeComponents"
                    );
                    return dataCubeComponents.dimensions;
                  })
                  .filter(truthy)
                  .flat(),
              }),
              measures: queries.flatMap((q) => {
                const measures = q.data?.dataCubeComponents.measures;
                assert(measures !== undefined, "Undefined measures");
                return measures;
              }),
            },
          },
    error,
    fetching,
  };
};

/** Fetches components/dimensions along with the values */
export const useDataCubesComponentsQuery = makeUseQuery<
  DataCubesComponentsOptions & { chartConfig: ChartConfig },
  DataCubesComponentsData
>({
  fetch: executeDataCubesComponentsQuery,
  transform: transformDataCubesComponents,
});

/**
 * Transforms the data from the data cubes components query.
 *
 * @param data - The data from the data cubes components query.
 * @param options - The options for the data cubes components query.
 * @returns The transformed data.
 */
export function transformDataCubesComponents(
  data: {
    data?: DataCubesComponentsData | null;
    error?: Error;
    fetching: boolean;
  },
  options: DataCubesComponentsOptions & { chartConfig: ChartConfig }
) {
  const {
    chartConfig: { conversionUnitsByComponentId },
    variables: { locale },
  } = options;

  if (
    !data.data ||
    !conversionUnitsByComponentId ||
    Object.keys(conversionUnitsByComponentId).length === 0
  ) {
    return data;
  }

  return {
    ...data,
    data: {
      ...data.data,
      dataCubesComponents: {
        ...data.data.dataCubesComponents,
        measures: data.data.dataCubesComponents.measures.map((measure) => {
          const conversionUnit = conversionUnitsByComponentId[measure.id];

          if (!conversionUnit) {
            return measure;
          }

          return {
            ...measure,
            unit: conversionUnit.labels[locale as Locale] ?? measure.unit,
            originalUnit: measure.unit,
            limits: measure.limits.map((limit) => {
              switch (limit.type) {
                case "single":
                  return {
                    ...limit,
                    value: limit.value * conversionUnit.multiplier,
                  };
                case "range":
                  return {
                    ...limit,
                    from: limit.from * conversionUnit.multiplier,
                    to: limit.to * conversionUnit.multiplier,
                  };
                default:
                  const _exhaustiveCheck: never = limit;
                  return _exhaustiveCheck;
              }
            }),
            values: measure.values.map((value) => {
              if (typeof value.value === "number") {
                return {
                  ...value,
                  value: value.value * conversionUnit.multiplier,
                };
              }

              if (typeof value.value === "string") {
                return {
                  ...value,
                  value: Number(value.value) * conversionUnit.multiplier,
                };
              }

              return value;
            }),
          };
        }),
      },
    },
  };
}

export type DataCubesObservationsOptions = {
  variables: Omit<DataCubeComponentsQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeObservationFilter[];
  };
  pause?: boolean;
};

type DataCubesObservationsData = {
  dataCubesObservations: DataCubesObservations;
};

export const executeDataCubesObservationsQuery = async (
  client: Client,
  variables: DataCubesObservationsOptions["variables"],
  /** Callback triggered when data fetching starts (cache miss). */
  onFetching?: () => void
) => {
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;

  const queries = await Promise.all(
    cubeFilters.map((cubeFilter) => {
      const cubeVariables = { locale, sourceType, sourceUrl, cubeFilter };

      const cached = client.readQuery<
        DataCubeObservationsQuery,
        DataCubeObservationsQueryVariables
      >(DataCubeObservationsDocument, cubeVariables);

      if (cached) {
        return Promise.resolve(cached);
      }

      onFetching?.();

      // If not in cache, execute the query
      return client
        .query<
          DataCubeObservationsQuery,
          DataCubeObservationsQueryVariables
        >(DataCubeObservationsDocument, cubeVariables)
        .toPromise();
    })
  );

  const error = queries.find((q) => q.error)?.error;
  const fetching = !error && queries.some((q) => !q.data);

  if (error || fetching) {
    return {
      data: undefined,
      error,
      fetching,
    };
  }

  const observations =
    // If we are fetching data from multiple cubes, we need to merge them into one
    queries.length > 1
      ? mergeObservations(queries)
      : // If we are fetching data from a single cube, we can just return the data
        queries[0].data?.dataCubeObservations?.data!;

  return {
    data: {
      dataCubesObservations: {
        data: observations,
        sparqlEditorUrls: queries.flatMap((q) => ({
          cubeIri: q.operation.variables?.cubeFilter.iri!,
          url: q.data?.dataCubeObservations?.sparqlEditorUrl!,
        })),
      },
    },
    error,
    fetching,
  };
};

export const useDataCubesObservationsQuery = makeUseQuery<
  DataCubesObservationsOptions & { chartConfig: ChartConfig },
  DataCubesObservationsData
>({
  fetch: executeDataCubesObservationsQuery,
  transform: transformDataCubesObservations,
});

/**
 * Transforms the data from the data cubes observations query.
 *
 * @param data - The data from the data cubes observations query.
 * @param options - The options for the data cubes observations query.
 * @returns The transformed data.
 */
export function transformDataCubesObservations(
  data: {
    data?: DataCubesObservationsData | null;
    error?: Error;
    fetching: boolean;
  },
  options: DataCubesObservationsOptions & { chartConfig: ChartConfig }
) {
  const {
    chartConfig: { conversionUnitsByComponentId },
  } = options;

  if (
    !data.data ||
    !conversionUnitsByComponentId ||
    Object.keys(conversionUnitsByComponentId).length === 0
  ) {
    return data;
  }

  return {
    ...data,
    data: {
      dataCubesObservations: {
        ...data.data.dataCubesObservations,
        data: data.data.dataCubesObservations.data.map((observation) => {
          const newObservation = { ...observation };

          Object.entries(conversionUnitsByComponentId).forEach(
            ([componentId, { multiplier }]) => {
              if (componentId in newObservation) {
                const value = newObservation[componentId];

                if (typeof value === "number") {
                  newObservation[componentId] = value * multiplier;
                } else if (typeof value === "string") {
                  newObservation[componentId] = Number(value) * multiplier;
                }
              }
            }
          );

          return newObservation;
        }),
      },
    },
  };
}

type FetchAllUsedCubeComponentsOptions = {
  state: ConfiguratorState;
  locale: Locale;
};

/**
 * Fetches all cubes components in one go. Is useful in contexts where we deal
 * with all the cubes at once, for example the shared dashboard filters.
 */
const executeFetchAllUsedCubeComponents = async (
  client: Client,
  variables: FetchAllUsedCubeComponentsOptions
) => {
  const { state, locale } = variables;
  const { dataSource } = state;
  assert(hasChartConfigs(state), "Expected state with chart configs");

  const cubeFilters: DataCubeComponentFilter[][] = state.chartConfigs.map(
    (config) => {
      return config.cubes.map((x) => ({
        iri: x.iri,
        joinBy: x.joinBy,
        loadValues: true,
      }));
    }
  );

  // executeDataCubesComponentsQuery dedupes queries through urql cache
  const dataCubesComponents = await Promise.all(
    cubeFilters.map((cf) =>
      executeDataCubesComponentsQuery(client, {
        cubeFilters: cf,
        locale,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
      })
    )
  );

  return {
    error: dataCubesComponents.find((x) => x.error)?.error,
    fetching: dataCubesComponents.some((x) => x.fetching),
    data: {
      dataCubesComponents: {
        dimensions: dataCubesComponents.flatMap(
          (x) => x?.data?.dataCubesComponents.dimensions ?? []
        ),
        measures: dataCubesComponents.flatMap(
          (x) => x?.data?.dataCubesComponents.measures ?? []
        ),
      },
    },
  };
};

export const useConfigsCubeComponents = makeUseQuery<
  {
    variables: FetchAllUsedCubeComponentsOptions;
    pause?: boolean | undefined;
  },
  Awaited<ReturnType<typeof executeFetchAllUsedCubeComponents>>["data"]
>({
  fetch: executeFetchAllUsedCubeComponents,
});

type DataCubesComponentTermsetsOptions = {
  variables: Omit<DataCubeComponentTermsetsQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeObservationFilter[];
  };
  pause?: boolean;
};

/**
 * Fetches all cubes termsets in one go.
 */
const executeDataCubesTermsetsQuery = async (
  client: Client,
  variables: DataCubesComponentTermsetsOptions["variables"],
  /** Callback triggered when data fetching starts (cache miss). */
  onFetching?: () => void
) => {
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;

  const queries = await Promise.all(
    cubeFilters.map((cubeFilter) => {
      const cubeVariables = { locale, sourceType, sourceUrl, cubeFilter };

      // Try to read from cache first
      const cached = client.readQuery<
        DataCubeComponentTermsetsQuery,
        DataCubeComponentTermsetsQueryVariables
      >(DataCubeComponentTermsetsDocument, cubeVariables);

      if (cached) {
        return Promise.resolve(cached);
      }

      onFetching?.();

      // If not in cache, execute the query
      return client
        .query<
          DataCubeComponentTermsetsQuery,
          DataCubeComponentTermsetsQueryVariables
        >(DataCubeComponentTermsetsDocument, cubeVariables)
        .toPromise();
    })
  );

  const error = queries.find((q) => q.error)?.error;
  const fetching = !error && queries.some((q) => !q.data);

  if (error || fetching) {
    return {
      data: undefined,
      error,
      fetching,
    };
  }

  const termsets =
    // If we are fetching data from multiple cubes, we need to merge them into one
    (
      queries.length > 1
        ? queries.map((q) => q.data?.dataCubeComponentTermsets).flat()
        : // If we are fetching data from a single cube, we can just return the data
          queries[0].data?.dataCubeComponentTermsets!
    ).filter(truthy);

  return {
    data: {
      dataCubeComponentTermsets: termsets,
    },
    error,
    fetching,
  };
};

export const useDataCubesComponentTermsetsQuery = makeUseQuery<
  DataCubesComponentTermsetsOptions,
  Awaited<ReturnType<typeof executeDataCubesTermsetsQuery>>["data"]
>({
  fetch: executeDataCubesTermsetsQuery,
});
