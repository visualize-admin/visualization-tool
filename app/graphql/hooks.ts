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

export const useDataCubesMetadataQuery = (options: {
  variables: Omit<DataCubeMetadataQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeMetadataFilter[];
  };
  pause?: boolean;
}) => {
  const { variables, pause } = options;
  const { locale, sourceType, sourceUrl, cubeFilters } = variables;
  const [result, setResult] = React.useState<{
    data?: { dataCubesMetadata: DataCubeMetadata[] };
    error?: Error;
    fetching: boolean;
  }>({ fetching: !pause });

  const queryKey = useQueryKey(options);

  React.useEffect(() => {
    if (pause) {
      return;
    }

    const run = async () => {
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

          if (!result.fetching) {
            setResult({
              ...result,
              fetching: true,
            });
          }

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

      setResult({
        data: fetching
          ? undefined
          : { dataCubesMetadata: queries.map((q) => q.data!.dataCubeMetadata) },
        error,
        fetching,
      });
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return [result];
};

type DataCubesComponentsOptions = {
  variables: Omit<DataCubeComponentsQueryVariables, "cubeFilter"> & {
    cubeFilters: DataCubeComponentFilter[];
  };
  pause?: boolean;
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

      if (onFetching) {
        onFetching();
      }

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

export const useDataCubesComponentsQuery = (
  options: DataCubesComponentsOptions
) => {
  const [result, setResult] = React.useState<{
    data?: { dataCubesComponents: DataCubeComponents };
    error?: Error;
    fetching: boolean;
  }>({ fetching: !options.pause });

  const queryKey = useQueryKey(options);

  const executeQuery = React.useCallback(
    async (options: DataCubesComponentsOptions) => {
      const result = await executeDataCubesComponentsQuery(
        options.variables,
        () => setResult((prev) => ({ ...prev, fetching: true }))
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
