import { StoreApi, useStore } from "zustand";

export type UseBoundStoreWithSelector<S> = {
  (): ExtractState<S>;
  <T>(
    selector: (state: ExtractState<S>) => T,
    equals?: (a: T, b: T) => boolean
  ): T;
};

export const createBoundUseStoreWithSelector = ((store) => (selector, equals) =>
  useStore(store, selector as never, equals)) as <S extends StoreApi<unknown>>(
  store: S
) => UseBoundStoreWithSelector<S>;

export type ExtractState<S> = S extends { getState: () => infer X } ? X : never;
