import { DataSource } from "@/config-types";
import { DataCubeComponents } from "@/domain/data";
import { truthy } from "@/domain/types";
import { client } from "@/graphql/client";
import { joinDimensions } from "@/graphql/join";
import {
  DataCubeComponentFilter,
  DataCubeComponentsDocument,
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
} from "@/graphql/query-hooks";
import { Locale } from "@/locales/locales";

/**
 * Reads components from client cache, reading cube by cube.
 * Components are not joined in cache, but transformed here.
 */
export const getCachedComponents = ({
  locale,
  dataSource,
  cubeFilters,
}: {
  locale: Locale;
  dataSource: DataSource;
  cubeFilters: DataCubeComponentFilter[];
}): DataCubeComponents | undefined => {
  const queries = cubeFilters
    .map((cubeFilter) => {
      return client.readQuery<
        DataCubeComponentsQuery,
        DataCubeComponentsQueryVariables
      >(DataCubeComponentsDocument, {
        locale,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        cubeFilter: {
          iri: cubeFilter.iri,
          componentIds: undefined,
          joinBy: cubeFilter.joinBy,
          loadValues: true,
        },
      });
    })
    .filter(truthy);
  return {
    dimensions: joinDimensions(
      queries
        .filter((x) => x.data)
        .map((x) => ({
          dataCubeComponents: x.data?.dataCubeComponents!,
          joinBy: x.operation.variables?.cubeFilter.joinBy,
        }))
    ),
    measures: queries.flatMap((q) => q.data?.dataCubeComponents.measures!),
  };
};
