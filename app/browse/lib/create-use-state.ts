import { useMemo, useRef, useState } from "react";

import {
  BrowseFilter,
  getFiltersFromParams,
  getParamsFromFilters,
} from "@/browse/lib/filters";
import { BrowseParams } from "@/browse/lib/params";
import { useUrlSyncState } from "@/browse/lib/use-url-sync-state";
import { SearchCubeResultOrder } from "@/graphql/query-hooks";
import { useEvent } from "@/utils/use-event";

/**
 * Creates a hook that provides the current browse state and actions to update it.
 *
 * It will persist/recover this state from the URL if `syncWithUrl` is true.
 *
 * TODO: Might be a good idea to use a zustand store, where the persistency is controlled
 * via syncWithUrl. It would be a bit more explicit and easier to understand.
 */
export const createUseBrowseState = ({
  syncWithUrl,
}: {
  syncWithUrl: boolean;
}) => {
  const useParamsHook = syncWithUrl ? useUrlSyncState : useState<BrowseParams>;
  return () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [browseParams, setParams] = useParamsHook({});
    const {
      search,
      type,
      order,
      iri,
      includeDrafts,
      dataset: paramDataset,
    } = browseParams;
    const previousOrderRef = useRef(SearchCubeResultOrder.Score);

    // Support /browse?dataset=<iri> and legacy /browse/dataset/<iri>
    const dataset = type === "dataset" ? iri : paramDataset;
    const filters = getFiltersFromParams(browseParams);

    const setSearch = useEvent((v: string) =>
      setParams((prev) => ({ ...prev, search: v }))
    );
    const setIncludeDrafts = useEvent((v: boolean) =>
      setParams((prev) => ({ ...prev, includeDrafts: v }))
    );
    const setOrder = useEvent((v: SearchCubeResultOrder) =>
      setParams((prev) => ({ ...prev, order: v }))
    );
    const setDataset = useEvent((v: string) =>
      setParams((prev) => ({ ...prev, dataset: v }))
    );

    return useMemo(() => {
      const { CreatedDesc, Score } = SearchCubeResultOrder;
      const previousOrder = previousOrderRef.current;

      return {
        inputRef,
        includeDrafts: !!includeDrafts,
        setIncludeDrafts,
        onReset: () => {
          setParams((prev) => ({
            ...prev,
            search: "",
            order: previousOrder === Score ? CreatedDesc : previousOrder,
          }));
        },
        onSubmitSearch: (newSearch: string) => {
          setParams((prev) => ({
            ...prev,
            search: newSearch,
            order: newSearch === "" ? CreatedDesc : previousOrder,
          }));
        },
        search,
        order,
        onSetOrder: (order: SearchCubeResultOrder) => {
          previousOrderRef.current = order;
          setOrder(order);
        },
        setSearch,
        setOrder,
        dataset,
        setDataset,
        filters,
        setFilters: (filters: BrowseFilter[]) => {
          setParams((prev) => ({
            ...prev,
            ...getParamsFromFilters(filters),
          }));
        },
      };
    }, [
      includeDrafts,
      setIncludeDrafts,
      search,
      order,
      setSearch,
      setOrder,
      dataset,
      setDataset,
      filters,
      setParams,
    ]);
  };
};
