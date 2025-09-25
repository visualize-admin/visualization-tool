import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import {
  buildURLFromBrowseParams,
  extractParamFromPath,
  getBrowseParamsFromQuery,
} from "@/browse/lib/params";
import { BrowseParams } from "@/pages/browse";
import { maybeWindow } from "@/utils/maybe-window";
import { useEvent } from "@/utils/use-event";

export const useUrlSyncState = (initialState: BrowseParams) => {
  const router = useRouter();
  const [state, rawSetState] = useState(() => {
    // Rely directly on window instead of router since router takes a bit of time
    // to be initialized
    const window = maybeWindow();
    const searchParams = window
      ? new URL(window.location.href).searchParams
      : undefined;
    const dataset = extractParamFromPath(router.asPath, "dataset");
    const query = searchParams
      ? Object.fromEntries(searchParams.entries())
      : undefined;

    if (dataset && query && !query.dataset) {
      query.dataset = dataset[0];
    }

    if (query) {
      return getBrowseParamsFromQuery(query);
    }

    return initialState;
  });

  useEffect(() => {
    if (router.isReady) {
      const browseParams = getBrowseParamsFromQuery(router.query);
      rawSetState(browseParams);
    }
  }, [router.isReady, router.query]);

  const setState = useEvent(
    (stateUpdate: BrowseParams | ((prev: BrowseParams) => BrowseParams)) => {
      rawSetState((prev) => {
        const newState = {
          ...(stateUpdate instanceof Function
            ? stateUpdate(prev)
            : stateUpdate),
        } satisfies BrowseParams;
        const url = buildURLFromBrowseParams(newState);
        router.replace(url, undefined, { shallow: true });

        return newState;
      });
    }
  );

  return [state, setState] as const;
};
