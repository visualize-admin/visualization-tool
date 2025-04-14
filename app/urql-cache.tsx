import { DataSource } from "@/config-types";
import { JoinBy } from "@/configurator/components/add-dataset-dialog/infer-join-by";
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

  const joinBy: JoinBy = Object.fromEntries(
    cubeFilters
      .map((cubeFilter) => {
        return [cubeFilter.iri, cubeFilter.joinBy];
      })
      .filter(truthy)
  );

  return {
    dimensions: joinDimensions({
      dimensions: queries
        .filter((x) => x.data)
        .map((x) => x.data?.dataCubeComponents?.dimensions!)
        .flat(),
      joinBy: joinBy,
    }),
    measures: queries.flatMap((q) => q.data?.dataCubeComponents.measures!),
  };
};
