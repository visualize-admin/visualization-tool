import React from "react";

import {
  DataCubeComponents,
  DataCubeMetadata,
  DataCubesObservations,
} from "@/domain/data";

import { client } from "./client";
import { mergeObservations } from "./hook-utils";
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
  return React.useMemo(() => {
    return JSON.stringify(options);
  }, [options]);
};

const makeUseQuery =
  <T extends { variables: object; pause?: boolean }, V>(
    executeQueryFn: (
      options: T["variables"],
      onFetching?: () => void
    ) => Promise<{
      data?: V;
      error?: Error;
      fetching: boolean;
    }>
  ) =>
  (options: T) => {
    const [result, setResult] = React.useState<{
      data?: V;
      error?: Error;
      fetching: boolean;
    }>({ fetching: !options.pause });
    const queryKey = useQueryKey(options);
    const executeQuery = React.useCallback(
      async (options: T) => {
        const result = await executeQueryFn(options.variables, () =>
          setResult((prev) => ({ ...prev, fetching: true }))
        );
        setResult(result);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [queryKey]
    );

    React.useEffect(() => {
      if (options.pause) {
        return;
      }

      executeQuery(options);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey]);

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
        .query<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>(
          DataCubeMetadataDocument,
          cubeVariables
        )
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

type DataCubesComponentsOptions = {
  variables: Omit<DataCubeComponentsQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeComponentFilter[];
  };
  pause?: boolean;
};

type DataCubesComponentsData = {
  dataCubesComponents: DataCubeComponents;
};

export const executeDataCubesComponentsQuery = async (
  variables: DataCubesComponentsOptions["variables"],
  /** Callback triggered when data fetching starts (cache miss). */
  onFetching?: () => void
) => {
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;

  const queries = await Promise.all(
    cubeFilters.map((cubeFilter) => {
      const cubeVariables = { locale, sourceType, sourceUrl, cubeFilter };
      const cached = client.readQuery<
        DataCubeComponentsQuery,
        DataCubeComponentsQueryVariables
      >(DataCubeComponentsDocument, cubeVariables);

      if (cached) {
        return Promise.resolve(cached);
      }

      onFetching?.();

      return client
        .query<DataCubeComponentsQuery, DataCubeComponentsQueryVariables>(
          DataCubeComponentsDocument,
          cubeVariables
        )
        .toPromise();
    })
  );

  const error = queries.find((q) => q.error)?.error;
  const fetching = !error && queries.some((q) => !q.data);

  return {
    data:
      error || fetching
        ? undefined
        : {
            dataCubesComponents: {
              dimensions: queries.flatMap(
                (q) => q.data?.dataCubeComponents.dimensions!
              ),
              measures: queries.flatMap(
                (q) => q.data?.dataCubeComponents.measures!
              ),
            },
          },
    error,
    fetching,
  };
};

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
        .query<DataCubeObservationsQuery, DataCubeObservationsQueryVariables>(
          DataCubeObservationsDocument,
          cubeVariables
        )
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
