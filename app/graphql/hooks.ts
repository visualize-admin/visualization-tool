import React from "react";

import { DataCubeComponents, DataCubeMetadata } from "@/domain/data";

import { client } from "./client";
import {
  DataCubeComponentFilter,
  DataCubeComponentsDocument,
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
  DataCubeMetadataDocument,
  DataCubeMetadataFilter,
  DataCubeMetadataQuery,
  DataCubeMetadataQueryVariables,
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
    data: fetching
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
    data: fetching
      ? undefined
      : {
          dataCubesComponents: queries.reduce<DataCubeComponents>(
            (acc, query) => {
              const { dimensions, measures } = query.data?.dataCubeComponents!;
              acc.dimensions.push(...dimensions);
              acc.measures.push(...measures);

              return acc;
            },
            { dimensions: [], measures: [] }
          ),
        },
    error,
    fetching,
  };
};

export const useDataCubesComponentsQuery = makeUseQuery<
  DataCubesComponentsOptions,
  DataCubesComponentsData
>(executeDataCubesComponentsQuery);
