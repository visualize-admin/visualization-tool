import { useRouter } from "next/router";
import React, { useCallback } from "react";
import SearchAutocomplete, {
  SearchAutocompleteItem,
} from "@/components/search-autocomplete";

/**
 * Autocomplete to navigate to
 * - Themes
 * - Organizations
 * - Free search
 *
 * Not used yet but could serve one day
 */
const BrowsingAutocomplete = () => {
  const router = useRouter();

  const handleSelectAutocompleteItem = useCallback(
    ({ selectedItem }: { selectedItem?: SearchAutocompleteItem | null }) => {
      if (!selectedItem) {
        return;
      }
      let path: string;
      switch (selectedItem.__typename) {
        case "DataCubeOrganization":
          path = `/browse/organization/${encodeURIComponent(selectedItem.iri)}`;
          break;
        case "DataCubeTheme":
          path = `/browse/theme/${encodeURIComponent(selectedItem.iri)}`;
          break;
        case "FreeSearchItem":
          path = `/browse?search=${encodeURIComponent(selectedItem.text)}`;
          break;
      }
      router.push(path);
    },
    [router]
  );

  return (
    <SearchAutocomplete
      placeholder="Search datasets..."
      onSelectedItemChange={handleSelectAutocompleteItem}
    />
  );
};

export default BrowsingAutocomplete;
