import React, { useMemo } from "react";
import { SearchFilter } from "../configurator/components/dataset-search";
import { useOrganizationsQuery, useThemesQuery } from "../graphql/query-hooks";
import { useLocale } from "../src";
import Autocomplete, { AutocompleteProps } from "./autocomplete";

const SearchAutocomplete = (
  autocompleteProps: Omit<
    AutocompleteProps<SearchFilter>,
    "items" | "getItemSearchText"
  >
) => {
  const locale = useLocale();
  const [{ data: allThemes }] = useThemesQuery({ variables: { locale } });
  const [{ data: allOrgs }] = useOrganizationsQuery({ variables: { locale } });
  const allItems = useMemo(
    () => [...(allThemes?.themes || []), ...(allOrgs?.organizations || [])],
    [allThemes, allOrgs]
  );
  const getItemSearchText = (f: SearchFilter) => {
    return f.label || "";
  };
  return (
    <Autocomplete
      {...autocompleteProps}
      items={allItems}
      getItemSearchText={getItemSearchText}
    />
  );
};

export default SearchAutocomplete;
