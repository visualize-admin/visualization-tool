import React from "react";
import createStore, { StoreApi, UseBoundStore } from "zustand";

import {
  UseBoundStoreWithSelector,
  createBoundUseStoreWithSelector,
} from "./utils";

export type DragDropState<T = object, E = HTMLElement> = {
  source: T | null;
  sourceElement: E | null;
  target: T | null;
  targetElement: E | null;
  handleDragStart: (source: T, sourceElement: E) => void;
  handleDragUpdate: (target: T | null, targetElement: E | null) => void;
  handleDragEnd: (
    callback: (state: {
      source: T | null;
      sourceElement: E | null;
      target: T | null;
      targetElement: E | null;
    }) => void
  ) => void;
};

export const createDragDropStore = <T, E>() =>
  createStore<DragDropState<T, E>>((set, get) => ({
    source: null,
    sourceElement: null,
    target: null,
    targetElement: null,
    handleDragStart: (source, sourceElement) => {
      set({
        source,
        sourceElement,
        target: source,
        targetElement: sourceElement,
      });
    },
    handleDragUpdate: (target, targetElement) => {
      set({ target, targetElement });
    },
    handleDragEnd: (callback) => {
      const { source, sourceElement, target, targetElement } = get();
      callback({
        source,
        sourceElement,
        target,
        targetElement,
      });
      set({
        source: null,
        sourceElement: null,
        target: null,
        targetElement: null,
      });
    },
  }));

export const createDragDropContext = <T, E>() => {
  return React.createContext<
    | [
        UseBoundStore<StoreApi<DragDropState<T, E>>>,
        UseBoundStoreWithSelector<StoreApi<DragDropState<T, E>>>
      ]
    | undefined
  >(undefined);
};

type DragDropContext<T, E> = React.Context<
  | [
      UseBoundStore<StoreApi<DragDropState<T, E>>>,
      UseBoundStoreWithSelector<StoreApi<DragDropState<T, E>>>
    ]
  | undefined
>;

type DragDropProviderProps<T, E> = {
  Context: DragDropContext<T, E>;
};

export const DragDropProvider = <T, E>(
  props: React.PropsWithChildren<DragDropProviderProps<T, E>>
) => {
  const { children, Context } = props;
  const [state] = React.useState<
    [
      UseBoundStore<StoreApi<DragDropState<T, E>>>,
      UseBoundStoreWithSelector<StoreApi<DragDropState<T, E>>>
    ]
  >(() => {
    const store = createDragDropStore<T, E>();
    return [store, createBoundUseStoreWithSelector(store)];
  });

  return <Context.Provider value={state}>{children}</Context.Provider>;
};

export const createUseDragDrop =
  <T, E>(Context: DragDropContext<T, E>) =>
  <S,>(selector: (state: DragDropState<T, E>) => S) => {
    const ctx = React.useContext(Context);

    if (!ctx) {
      throw new Error(
        "useChartDragDrop must be called inside a ChartDragDropProvider.Provider!"
      );
    }

    const [, useStore] = ctx;

    return useStore(selector);
  };

export const createUseDragDropRaw =
  <T, E>(Context: DragDropContext<T, E>) =>
  () => {
    const ctx = React.useContext(Context);

    if (!ctx) {
      throw new Error(
        "useDragDropRaw must be called inside a DragDropProvider!"
      );
    }

    const [store] = ctx;

    return store;
  };
