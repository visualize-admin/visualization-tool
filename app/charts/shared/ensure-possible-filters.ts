import { SingleFilters } from "@/config-types";

/** Used to make urql re-query when order of filters changes. */
export const getPossibleFiltersQueryKey = (unmappedFilters: SingleFilters) => {
  return Object.keys(unmappedFilters).join(", ");
};
