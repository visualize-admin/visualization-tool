import React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { Observable } from "@/utils/observables";

export class LoadingState extends Observable {
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

const LoadingStateContext = React.createContext<LoadingState | undefined>(
  undefined
);

/** Used to consolidate loading state across different components.
 *
 * It was primarly implemented to avoid being in "data loaded" state,
 * which displays a `<NoDataHint>`, when interactive filters are still
 * being fetched.
 */
export const useLoadingState = () => {
  const ctx = React.useContext(LoadingStateContext);

  if (!ctx) {
    throw new Error(
      "useLoadingState must be called inside a LoadingStateContext.Provider!"
    );
  }

  useSyncExternalStore(ctx.subscribe, ctx.getUpdateKey);

  return ctx;
};

export const LoadingStateProvider = (props: React.PropsWithChildren<{}>) => {
  const loadingState = React.useMemo(() => new LoadingState(), []);
  return <LoadingStateContext.Provider value={loadingState} {...props} />;
};
