import React from "react";

import { DataCubeMetadata } from "@/domain/data";

import { client } from "./client";
import {
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
