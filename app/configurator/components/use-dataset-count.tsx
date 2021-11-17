import { useMemo } from "react";
import { useDatasetCountQuery } from "../../graphql/query-hooks";
import isTypename from "../../utils/isTypename";
import { SearchFilter } from "./dataset-search";

const countListToIndexedCount = (l: { count: number; iri: string }[]) =>
  Object.fromEntries(l.map((o) => [o.iri, o.count]));
const useDatasetCount = (filters: SearchFilter[]): Record<string, number> => {
  const [{ data: datasetCounts }] = useDatasetCountQuery({
    variables: {
      theme: filters.find(isTypename("DataCubeTheme"))?.iri,
      organization: filters.find(isTypename("DataCubeOrganization"))?.iri,
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
