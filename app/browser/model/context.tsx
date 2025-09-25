import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BrowseFilter,
  getFiltersFromParams,
  getParamsFromFilters,
} from "@/browser/lib/filters";
import { useUrlSyncState } from "@/browser/lib/use-url-sync-state";
import { SearchCubeResultOrder } from "@/graphql/query-hooks";
import { BrowseParams } from "@/pages/browse";
import { useEvent } from "@/utils/use-event";

/**
 * Creates a hook that provides the current browse state and actions to update it.
 *
 * It will persist/recover this state from the URL if `syncWithUrl` is true.
 *
 * TODO: Might be a good idea to use a zustand store, where the persistency is controlled
 * via syncWithUrl. It would be a bit more explicit and easier to understand.
 */
const createUseBrowseState = ({ syncWithUrl }: { syncWithUrl: boolean }) => {
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

    return useMemo(
      () => ({
        inputRef,
        includeDrafts: !!includeDrafts,
        setIncludeDrafts,
        onReset: () => {
          setParams((prev) => ({
            ...prev,
            search: "",
            order:
              previousOrderRef.current === SearchCubeResultOrder.Score
                ? SearchCubeResultOrder.CreatedDesc
                : previousOrderRef.current,
          }));
        },
        onSubmitSearch: (newSearch: string) => {
          setParams((prev) => ({
            ...prev,
            search: newSearch,
            order:
              newSearch === ""
                ? SearchCubeResultOrder.CreatedDesc
                : previousOrderRef.current,
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
      }),
      [
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
      ]
    );
  };
};

export type BrowseState = ReturnType<ReturnType<typeof createUseBrowseState>>;
const BrowseContext = createContext<BrowseState | undefined>(undefined);

const useBrowseState = ({ syncWithUrl }: { syncWithUrl: boolean }) => {
  // Use useState here to make sure that the hook is only created once.
  // /!\ It will not react if syncWithUrl changes
  const [useBrowseStateHook] = useState(() =>
    createUseBrowseState({ syncWithUrl })
  );

  return useBrowseStateHook();
};

/**
 * Provides browse context to children below
 * Responsible for connecting the router to the browsing state
 */
export const BrowseStateProvider = ({
  children,
  syncWithUrl,
}: {
  children: ReactNode;
  syncWithUrl: boolean;
}) => {
  const browseState = useBrowseState({ syncWithUrl });

  return (
    <BrowseContext.Provider value={browseState}>
      {children}
    </BrowseContext.Provider>
  );
};

export const useBrowseContext = () => {
  const ctx = useContext(BrowseContext);

  if (!ctx) {
    throw Error(
      "To be able useBrowseContext, you must wrap it into a BrowseStateProvider"
    );
  }

  return ctx;
};
