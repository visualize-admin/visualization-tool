import isEmpty from "lodash/isEmpty";

import { DataSource, Filters, SingleFilters } from "@/config-types";
import { PossibleFiltersQueryVariables } from "@/graphql/query-hooks";
import { orderedIsEqual } from "@/utils/ordered-is-equal";

/** Used to make urql re-query when order of filters changes. */
const getPossibleFiltersQueryKey = (unmappedFilters: SingleFilters) => {
  return Object.keys(unmappedFilters).join(", ");
};

export const getPossibleFiltersQueryVariables = (props: {
  cubeIri: string;
  dataSource: DataSource;
  unmappedFilters: SingleFilters;
}): PossibleFiltersQueryVariables => {
  const { cubeIri, dataSource, unmappedFilters } = props;
  const filterKey = getPossibleFiltersQueryKey(unmappedFilters);
  return {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    cubeFilter: {
      iri: cubeIri,
      filters: unmappedFilters,
    },
    // @ts-ignore
    filterKey,
  };
};

export const skipPossibleFiltersQuery = (
  oldFilters: Filters | undefined,
  newFilters: SingleFilters
) => {
  return (
    (oldFilters && orderedIsEqual(oldFilters, newFilters)) ||
    isEmpty(newFilters)
  );
};
