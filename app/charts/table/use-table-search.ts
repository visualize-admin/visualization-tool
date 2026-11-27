import FlexSearch from "flexsearch";
import { useMemo, useState } from "react";

import { TableChartState } from "@/charts/table/table-state";
import { isNumericalMeasure, Observation } from "@/domain/data";
import { useStableIds } from "@/utils/use-stable-ids";

export const useTableSearch = ({
  observations,
  tableColumnsMeta,
  searchTerm,
}: {
  observations: Observation[];
  tableColumnsMeta: TableChartState["tableColumnsMeta"];
  searchTerm: string;
}) => {
  const [hasSearched, setHasSearched] = useState(false);

  if (searchTerm !== "" && !hasSearched) {
    setHasSearched(true);
  }

  const searchFields = useStableIds(getSearchFields(tableColumnsMeta));
  const searchIndex = useMemo(() => {
    return hasSearched
      ? createSearchIndex({ observations, searchFields })
      : undefined;
  }, [hasSearched, observations, searchFields]);

  return useMemo(() => {
    return searchIndex && searchTerm !== ""
      ? (searchIndex.search({ query: searchTerm }) as unknown as Observation[])
      : observations;
  }, [observations, searchIndex, searchTerm]);
};

const getSearchFields = (
  tableColumnsMeta: TableChartState["tableColumnsMeta"]
) => {
  return Object.values(tableColumnsMeta).flatMap((meta) =>
    isNumericalMeasure(meta.dim) ? [] : [meta.slugifiedId]
  );
};

const createSearchIndex = ({
  observations,
  searchFields,
}: {
  observations: Observation[];
  searchFields: string[];
}) => {
  const index = FlexSearch.create({
    tokenize: "full",
    doc: {
      id: "id",
      field: searchFields,
    },
  });

  index.add(observations);

  return index;
};
