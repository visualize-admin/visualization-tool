import { ConfiguratorStateConfiguringChart } from "@/config-types";
import { DataCubeComponents } from "@/domain/data";
import { truthy } from "@/domain/types";
import { client } from "@/graphql/client";
import { joinDimensions } from "@/graphql/hook-utils";
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
export const getCachedComponents = (
  draft: ConfiguratorStateConfiguringChart,
  cubeFilters: DataCubeComponentFilter[],
  locale: Locale
): DataCubeComponents | undefined => {
  const queries = cubeFilters
    .map((cubeFilter) => {
      return client.readQuery<
        DataCubeComponentsQuery,
        DataCubeComponentsQueryVariables
      >(DataCubeComponentsDocument, {
        sourceType: draft.dataSource.type,
        sourceUrl: draft.dataSource.url,
        locale,
        cubeFilter: {
          iri: cubeFilter.iri,
          componentIris: undefined,
          joinBy: cubeFilter.joinBy,
          loadValues: true,
        },
      })!;
    })
    .filter(truthy);

  return {
    dimensions: joinDimensions(queries),
    measures: queries.flatMap((q) => q.data?.dataCubeComponents.measures!),
  };
};
