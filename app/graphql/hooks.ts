import { useCallback, useEffect, useMemo, useState } from "react";
import { Client, useClient } from "urql";

import {
  DataCubeComponents,
  DataCubeMetadata,
  DataCubesObservations,
} from "@/domain/data";
import { assert } from "@/utils/assert";

import { joinDimensions, mergeObservations } from "./join";
import {
  DataCubeComponentFilter,
  DataCubeComponentsDocument,
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
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
  >(
    executeQueryFn: (
      client: Client,
      options: T["variables"],
      onFetching?: () => void
    ) => Promise<{
      data?: V;
      error?: Error;
      fetching: boolean;
    }>
  ) =>
  (options: T & { keepPreviousData?: boolean }) => {
    const client = useClient();
    const [result, setResult] = useState<{
      queryKey: string | null;
      data?: V | null;
      error?: Error;
      fetching: boolean;
    }>({ fetching: !options.pause, queryKey: null, data: null });
    const { keepPreviousData } = options;
    const queryKey = useQueryKey(options);
    const executeQuery = useCallback(
      async (options: T) => {
        setResult((prev) => ({
          ...prev,
          fetching: false,
          data:
            prev.queryKey === queryKey || keepPreviousData ? prev.data : null,
          queryKey,
        }));
        const result = await executeQueryFn(client, options.variables, () => {
          setResult((prev) => ({
            ...prev,
            fetching: true,
          }));
        });
        setResult({ ...result, queryKey });
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

export const executeDataCubesMetadataQuery = async (
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
>(executeDataCubesMetadataQuery);

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

  if (cubeFilters.length > 1 && !cubeFilters.every((f) => f.joinBy)) {
    throw new Error(
      "When fetching data from multiple cubes, all cube filters must have joinBy property set."
    );
  }

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
              dimensions: joinDimensions(
                queries.map((q) => {
                  const dataCubeComponents = q.data?.dataCubeComponents;
                  const joinBy = q.operation.variables?.cubeFilter.joinBy;
                  assert(
                    dataCubeComponents !== undefined,
                    "Undefined dataCubeComponents"
                  );
                  assert(joinBy, "Undefined joinBy");
                  return {
                    dataCubeComponents,
                    joinBy,
                  };
                })
              ),
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
  DataCubesComponentsOptions,
  DataCubesComponentsData
>(executeDataCubesComponentsQuery);

type DataCubesObservationsOptions = {
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

  if (cubeFilters.length > 1 && !cubeFilters.every((f) => f.joinBy)) {
    throw new Error(
      "When fetching data from multiple cubes, all cube filters must have joinBy property set."
    );
  }

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
  DataCubesObservationsOptions,
  DataCubesObservationsData
>(executeDataCubesObservationsQuery);
