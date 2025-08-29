import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, useClient } from "urql";

import {
  ChartConfig,
  ConfiguratorState,
  ConversionUnit,
  hasChartConfigs,
} from "@/configurator";
import {
  DataCubeComponents,
  DataCubeMetadata,
  DataCubesObservations,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { Locale } from "@/locales/locales";
import { LimitSingle, LimitTimeRange, LimitValueRange } from "@/rdf/limits";
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
  DataCubeObservationsPaginatedDocument,
  DataCubeObservationsPaginatedQuery,
  DataCubeObservationsPaginatedQueryVariables,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
} from "./query-hooks";

const queryResultsCache = new Map<string, any>();

const useQueryKey = (options: object) => {
  return useMemo(() => {
    return JSON.stringify(options);
  }, [options]);
};

export const makeUseQuery =
  <
    T extends {
      chartConfig?: ChartConfig;
      variables: object & { locale: string };
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
      options: {
        locale: string;
        conversionUnitsByComponentId: ChartConfig["conversionUnitsByComponentId"];
      }
    ) => { data?: V | null; error?: Error; fetching: boolean };
  }) =>
  (options: T & { keepPreviousData?: boolean }) => {
    const client = useClient();
    const { keepPreviousData } = options;
    const queryKey = useQueryKey(options);
    const cachedResult = queryResultsCache.get(queryKey);
    const [rawResult, setRawResult] = useState<{
      queryKey: string | null;
      data?: V | null;
      error?: Error;
      fetching: boolean;
    }>(
      cachedResult || { fetching: !options.pause, queryKey: null, data: null }
    );
    const currentQueryRef = useRef<string>();

    if (!options.pause && check) {
      check(options.variables);
    }

    const executeQuery = useCallback(
      async (options: { variables: T["variables"] }) => {
        const currentQuery = queryKey;
        currentQueryRef.current = currentQuery;

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
          if (currentQueryRef.current === currentQuery) {
            setRawResult((prev) => ({
              ...prev,
              fetching: true,
            }));
          }
        });

        if (currentQueryRef.current === currentQuery) {
          const finalResult = { ...result, queryKey };
          queryResultsCache.set(queryKey, finalResult);
          setRawResult(finalResult);
        }
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
      if (!transform || !options.chartConfig?.conversionUnitsByComponentId) {
        return rawResult;
      }

      return transform(rawResult, {
        locale: options.variables.locale,
        conversionUnitsByComponentId:
          options.chartConfig.conversionUnitsByComponentId,
      });
    }, [
      rawResult,
      options.variables.locale,
      options.chartConfig?.conversionUnitsByComponentId,
    ]);

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
    console.log("Error or fetching", { error, fetching });
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
 * Transforms the data from the data cubes components query, converting
 * the values to the overridden unit.
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
  options: {
    locale: string;
    conversionUnitsByComponentId: ChartConfig["conversionUnitsByComponentId"];
  }
) {
  const { locale, conversionUnitsByComponentId } = options;

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
                  const singleLimit: LimitSingle = {
                    ...limit,
                    value: convertValue(limit.value, conversionUnit),
                  };

                  return singleLimit;
                case "value-range":
                  const verticalRangeLimit: LimitValueRange = {
                    ...limit,
                    min: convertValue(limit.min, conversionUnit),
                    max: convertValue(limit.max, conversionUnit),
                  };

                  return verticalRangeLimit;
                case "time-range":
                  const horizontalRangeLimit: LimitTimeRange = {
                    ...limit,
                    value: convertValue(limit.value, conversionUnit),
                  };

                  return horizontalRangeLimit;
                default:
                  const _exhaustiveCheck: never = limit;
                  return _exhaustiveCheck;
              }
            }),
            values: measure.values.map((value) => {
              if (typeof value.value === "number") {
                return {
                  ...value,
                  value: convertValue(value.value, conversionUnit),
                };
              }

              if (typeof value.value === "string") {
                return {
                  ...value,
                  value: convertValue(Number(value.value), conversionUnit),
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

const convertValue = (value: number, conversionUnit: ConversionUnit) => {
  return value * conversionUnit.multiplier;
};

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
 * Transforms the data from the data cubes observations query, converting
 * the values to the overridden unit.
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
  options: {
    locale: string;
    conversionUnitsByComponentId: ChartConfig["conversionUnitsByComponentId"];
  }
) {
  const { conversionUnitsByComponentId } = options;

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
            ([componentId, conversionUnit]) => {
              if (componentId in newObservation) {
                const value = newObservation[componentId];

                if (typeof value === "number") {
                  newObservation[componentId] = convertValue(
                    value,
                    conversionUnit
                  );
                } else if (typeof value === "string") {
                  newObservation[componentId] = convertValue(
                    Number(value),
                    conversionUnit
                  );
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

export type DataCubesObservationsPaginatedOptions = {
  variables: Omit<DataCubeObservationsPaginatedQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeObservationFilter[];
  };
  pause?: boolean;
};

type DataCubesObservationsPaginatedData = {
  dataCubesObservationsPaginated: {
    data: DataCubesObservations;
    pagination: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      totalCount?: number | null;
      limit?: number | null;
      offset?: number | null;
    };
    sparqlEditorUrl: string;
  };
};

export const executeDataCubesObservationsPaginatedQuery = async (
  client: Client,
  variables: DataCubesObservationsPaginatedOptions["variables"],
  onFetching?: () => void
) => {
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;

  if (cubeFilters.length !== 1) {
    throw new Error("Pagination currently only supports single cube queries");
  }

  const cubeFilter = cubeFilters[0];
  const cubeVariables = { locale, sourceType, sourceUrl, cubeFilter };

  const cached = client.readQuery<
    DataCubeObservationsPaginatedQuery,
    DataCubeObservationsPaginatedQueryVariables
  >(DataCubeObservationsPaginatedDocument, cubeVariables);

  if (cached) {
    return Promise.resolve({
      data: {
        dataCubesObservationsPaginated: {
          data: {
            data: cached.data?.dataCubeObservationsPaginated.data.data || [],
            sparqlEditorUrls: [
              {
                cubeIri: cubeFilter.iri,
                url:
                  cached.data?.dataCubeObservationsPaginated.data.sparqlEditorUrl ||
                  "",
              },
            ],
          },
          pagination: cached.data?.dataCubeObservationsPaginated.pagination || {
            hasNextPage: false,
            hasPreviousPage: false,
            totalCount: 0,
            limit: 0,
            offset: 0,
          },
          sparqlEditorUrl:
            cached.data?.dataCubeObservationsPaginated.sparqlEditorUrl || "",
        },
      },
      error: cached.error,
      fetching: false,
    });
  }

  onFetching?.();

  const result = await client
    .query<
      DataCubeObservationsPaginatedQuery,
      DataCubeObservationsPaginatedQueryVariables
    >(DataCubeObservationsPaginatedDocument, cubeVariables)
    .toPromise();

  if (result.error || !result.data) {
    return {
      data: undefined,
      error: result.error,
      fetching: false,
    };
  }

  return {
    data: {
      dataCubesObservationsPaginated: {
        data: {
          data: result.data.dataCubeObservationsPaginated.data.data,
          sparqlEditorUrls: [
            {
              cubeIri: cubeFilter.iri,
              url: result.data.dataCubeObservationsPaginated.data.sparqlEditorUrl,
            },
          ],
        },
        pagination: result.data.dataCubeObservationsPaginated.pagination,
        sparqlEditorUrl:
          result.data.dataCubeObservationsPaginated.sparqlEditorUrl,
      },
    },
    error: result.error,
    fetching: false,
  };
};

const transformDataCubesObservationsPaginated = (
  data: {
    data?: DataCubesObservationsPaginatedData | null;
    error?: Error;
    fetching: boolean;
  },
  options: {
    locale: string;
    conversionUnitsByComponentId: ChartConfig["conversionUnitsByComponentId"];
  }
) => {
  const { conversionUnitsByComponentId } = options;

  if (
    !data.data ||
    !conversionUnitsByComponentId ||
    Object.keys(conversionUnitsByComponentId).length === 0
  ) {
    return data;
  }

  const transformedObservations = transformDataCubesObservations(
    {
      data: {
        dataCubesObservations: data.data.dataCubesObservationsPaginated.data,
      },
      error: data.error,
      fetching: data.fetching,
    },
    options
  );

  return {
    ...data,
    data: {
      dataCubesObservationsPaginated: {
        data:
          transformedObservations.data?.dataCubesObservations ||
          data.data.dataCubesObservationsPaginated.data,
        pagination: data.data.dataCubesObservationsPaginated.pagination,
        sparqlEditorUrl:
          data.data.dataCubesObservationsPaginated.sparqlEditorUrl,
      },
    },
  };
};

export const useDataCubesObservationsPaginatedQuery = makeUseQuery<
  DataCubesObservationsPaginatedOptions & { chartConfig: ChartConfig },
  DataCubesObservationsPaginatedData
>({
  fetch: executeDataCubesObservationsPaginatedQuery,
  transform: transformDataCubesObservationsPaginated,
});
