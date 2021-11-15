import React, { useMemo } from "react";
import { SearchFilter } from "../configurator/components/dataset-search";
import { useOrganizationsQuery, useThemesQuery } from "../graphql/query-hooks";
import SvgIcCategories from "../icons/components/IcCategories";
import SvgIcOrganisations from "../icons/components/IcOrganisations";
import { useLocale } from "../src";
import Autocomplete, { AutocompleteProps } from "./autocomplete";
import { Box } from "theme-ui";

const getItemIcon = (item: SearchFilter) => {
  if (item.__typename === "DataCubeTheme") {
    return (
      <Box as="span" sx={{ color: "categoryGreen" }}>
        <SvgIcOrganisations height={24} width={24} />
      </Box>
    );
  } else if (item.__typename === "DataCubeOrganization") {
    return (
      <Box as="span" sx={{ color: "organizationBlue" }}>
        <SvgIcCategories height={24} width={24} />
      </Box>
    );
  }
};
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
      getItemIcon={getItemIcon}
    />
  );
};

export default SearchAutocomplete;
