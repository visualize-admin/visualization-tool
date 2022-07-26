import { useMemo } from "react";

import { useDataSource } from "@/components/data-source-menu";
import { BrowseFilter } from "@/configurator/components/dataset-browse";
import { useDatasetCountQuery } from "@/graphql/query-hooks";
import isAttrEqual from "@/utils/is-attr-equal";

const countListToIndexedCount = (l: { count: number; iri: string }[]) =>
  Object.fromEntries(l.map((o) => [o.iri, o.count]));
const useDatasetCount = (
  filters: BrowseFilter[],
  includeDrafts: boolean
): Record<string, number> => {
  const [dataSource] = useDataSource();
  const [{ data: datasetCounts }] = useDatasetCountQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      includeDrafts,
      theme: filters.find(isAttrEqual("__typename", "DataCubeTheme"))?.iri,
      organization: filters.find(
        isAttrEqual("__typename", "DataCubeOrganization")
      )?.iri,
    },
  });

  return useMemo(
    () =>
      datasetCounts?.datasetcount
        ? countListToIndexedCount(datasetCounts?.datasetcount)
        : {},
    [datasetCounts]
  );
};

export default useDatasetCount;
