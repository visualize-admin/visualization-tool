import { DataSource, SingleFilters } from "@/config-types";
import { PossibleFiltersQueryVariables } from "@/graphql/query-hooks";

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
    iri: cubeIri,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    filters: unmappedFilters,
    // @ts-ignore
    filterKey,
  };
};
