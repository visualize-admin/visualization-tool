import { useMemo } from "react";
import { useDatasetCountQuery } from "../../graphql/query-hooks";
import { SearchFilter } from "./dataset-browse";
import isAttrEqual from "../../utils/is-attr-equal";

const countListToIndexedCount = (l: { count: number; iri: string }[]) =>
  Object.fromEntries(l.map((o) => [o.iri, o.count]));
const useDatasetCount = (filters: SearchFilter[]): Record<string, number> => {
  const [{ data: datasetCounts }] = useDatasetCountQuery({
    variables: {
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
