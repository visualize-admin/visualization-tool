import React, { useMemo } from "react";
import {
  BrowseFilter,
  DataCubeAbout,
  useBrowseContext,
} from "@/configurator/components/dataset-browse";
import { useOrganizationsQuery, useThemesQuery } from "@/graphql/query-hooks";
import SvgIcCategories from "@/icons/components/IcCategories";
import SvgIcOrganisations from "@/icons/components/IcOrganisations";
import { useLocale } from "@/src";
import Autocomplete, { AutocompleteProps } from "@/components/autocomplete";
import { Box } from "@mui/material";
import useDatasetCount from "@/configurator/components/use-dataset-count";
import { t } from "@lingui/macro";
import SvgIcText from "@/icons/components/IcText";

const getItemIcon = (item: SearchAutocompleteItem) => {
  if (item.__typename === "DataCubeTheme") {
    return (
      <Box component="span" sx={{ color: "categoryGreen" }}>
        <SvgIcOrganisations height={24} width={24} />
      </Box>
    );
  } else if (item.__typename === "DataCubeOrganization") {
    return (
      <Box component="span" sx={{ color: "organizationBlue" }}>
        <SvgIcCategories height={24} width={24} />
      </Box>
    );
  } else if (item.__typename === "FreeSearchItem") {
    return (
      <Box component="span" sx={{ color: "grey.500" }}>
        <SvgIcText height={24} width={24} />
      </Box>
    );
  }
};

type FreeSearchItem = {
  __typename: "FreeSearchItem";
  text: string;
};

export type SearchAutocompleteItem =
  | Exclude<BrowseFilter, DataCubeAbout>
  | FreeSearchItem;

const SearchAutocomplete = (
  autocompleteProps: Omit<
    AutocompleteProps<SearchAutocompleteItem>,
    "items" | "getItemSearchText"
  >
) => {
  const locale = useLocale();
  const { includeDrafts } = useBrowseContext();
  const counts = useDatasetCount([], includeDrafts);
  const [{ data: allThemes }] = useThemesQuery({ variables: { locale } });
  const [{ data: allOrgs }] = useOrganizationsQuery({ variables: { locale } });
  const allItems = useMemo(
    () =>
      [...(allThemes?.themes || []), ...(allOrgs?.organizations || [])].filter(
        (x) => counts[x.iri] > 0
      ),
    [allThemes, allOrgs, counts]
  );
  const getItemSearchText = (f: SearchAutocompleteItem) => {
    if (
      f.__typename === "DataCubeTheme" ||
      f.__typename === "DataCubeOrganization"
    ) {
      return t`Browse ${f.label}`;
    } else {
      return t`Search \u201C${f.text}\u201D`;
    }
  };
  return (
    <Autocomplete<SearchAutocompleteItem>
      {...autocompleteProps}
      items={allItems}
      getItemSearchText={getItemSearchText}
      getItemIcon={getItemIcon}
      generateItems={(inputValue) => [
        {
          __typename: "FreeSearchItem",
          text: inputValue,
        } as SearchAutocompleteItem,
      ]}
    />
  );
};

export default SearchAutocomplete;
