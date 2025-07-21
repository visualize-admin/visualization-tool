import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { Observable } from "@/utils/observables";

class LoadingState extends Observable {
  public loading: boolean = false;
  private map: Record<string, boolean> = {};

  constructor() {
    super();
  }

  public getUpdateKey = () => {
    return JSON.stringify(this.map);
  };

  set(iri: string, loading: boolean) {
    this.map[iri] = loading;
    this.resolveState();
  }

  private resolveState() {
    const _loading = this.loading;
    this.loading = Object.values(this.map).some((d) => d);

    if (!this.loading) {
      this.map = {};
    }

    if (_loading !== this.loading) {
      this.notify();
    }
  }
}

const LoadingStateContext = createContext<LoadingState | undefined>(undefined);

/** Used to consolidate loading state across different components.
 *
 * It was primarily implemented to avoid being in "data loaded" state,
 * which displays a `<NoDataHint>`, when interactive filters are still
 * being fetched.
 */
export const useLoadingState = () => {
  const ctx = useContext(LoadingStateContext);

  if (!ctx) {
    throw Error(
      "useLoadingState must be called inside a LoadingStateContext.Provider!"
    );
  }

  useSyncExternalStore(ctx.subscribe, ctx.getUpdateKey);

  return ctx;
};

export const LoadingStateProvider = (props: PropsWithChildren<{}>) => {
  const loadingState = useMemo(() => new LoadingState(), []);

  return <LoadingStateContext.Provider value={loadingState} {...props} />;
};
