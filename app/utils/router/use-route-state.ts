import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { updateRouterQuery } from "@/utils/router/helpers";
import { useEvent } from "@/utils/use-event";

/**
 * useState that keeps router param synchronized.
 */
export const useRouteState = <T>(
  initialState: T | (() => T),
  {
    param,
    onValueChange,
    deserialize,
    serialize,
    shouldValueBeSaved,
  }: {
    param: string;
    onValueChange: (val: T) => void;
    deserialize: (itemS: string) => T;
    serialize: (item: T) => string;
    shouldValueBeSaved?: (item: T) => boolean;
  }
) => {
  const router = useRouter();

  const [val, rawSetVal] = useState(initialState);

  const setVal = useEvent((newVal: T) => {
    if (val === newVal) {
      return;
    }
    rawSetVal(newVal);
    if (
      !shouldValueBeSaved ||
      shouldValueBeSaved?.(newVal) ||
      router.query[param]
    ) {
      updateRouterQuery(router, { [param]: serialize(newVal) });
    }
    onValueChange(newVal);
  });

  const handleRouteChange = useEvent(() => {
    const routerVal = router.query[param] as string;
    if (routerVal === undefined) {
      if (!shouldValueBeSaved || shouldValueBeSaved?.(val)) {
        // Update router to reflect local state
        updateRouterQuery(router, { [param]: serialize(val) });
      }
    } else {
      // Update local state to reflect router
      if (routerVal !== serialize(val)) {
        rawSetVal(deserialize(routerVal));
        onValueChange(val);
      }
    }
  });

  // Subscribe to route change to sync local state to router state
  useEffect(() => {
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [handleRouteChange, router.events]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    handleRouteChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return [val, setVal] as const;
};
