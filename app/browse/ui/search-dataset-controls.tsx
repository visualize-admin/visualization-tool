import { Divider } from "@mui/material";

import { BrowseState } from "@/browse/model/context";
import { SearchDatasetDraftsControl } from "@/browse/ui/dataset-browse";
import { SearchDatasetResultsCount } from "@/browse/ui/search-dataset-results-count";
import { SearchDatasetSortControl } from "@/browse/ui/search-dataset-sort-control";
import { Flex } from "@/components/flex";
import { SearchCubeResult, SearchCubeResultOrder } from "@/graphql/query-hooks";
import { sleep } from "@/utils/sleep";
import { useEvent } from "@/utils/use-event";

export const SearchDatasetControls = ({
  browseState: {
    inputRef,
    search,
    onSubmitSearch,
    includeDrafts,
    setIncludeDrafts,
    order = SearchCubeResultOrder.CreatedDesc,
    onSetOrder,
  },
  cubes,
}: {
  browseState: BrowseState;
  cubes: SearchCubeResult[];
}) => {
  const isSearching = search !== "" && search !== undefined;

  const onToggleIncludeDrafts = useEvent(async () => {
    setIncludeDrafts(!includeDrafts);
    const input = inputRef.current;

    if (input && input.value.length > 0) {
      // We need to wait here otherwise the includeDrafts is reset :/
      await sleep(200);
      onSubmitSearch(input.value);
    }
  });

  return (
    <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <SearchDatasetResultsCount cubes={cubes} />
      <Flex sx={{ alignItems: "center", gap: 5 }}>
        <SearchDatasetDraftsControl
          checked={includeDrafts}
          onChange={onToggleIncludeDrafts}
        />
        <Divider flexItem orientation="vertical" />
        <SearchDatasetSortControl
          value={order}
          onChange={onSetOrder}
          disableScore={!isSearching}
        />
      </Flex>
    </Flex>
  );
};
