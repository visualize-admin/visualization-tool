import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";

import { Component } from "@/domain/data";

type MetadataPanelSection = "general" | "data";

type MetadataPanelState = {
  open: boolean;
  activeSection: MetadataPanelSection;
  selectedDimension: Component | undefined;
  actions: {
    setOpen: (d: boolean) => void;
    toggle: () => void;
    setActiveSection: (d: MetadataPanelSection) => void;
    setSelectedDimension: (d: Component) => void;
    clearSelectedDimension: () => void;
    openDimension: (d: Component) => void;
    reset: () => void;
  };
};

export const createMetadataPanelStore = () =>
  createStore<MetadataPanelState>((set, get) => ({
    open: false,
    activeSection: "general",
    selectedDimension: undefined,
    actions: {
      setOpen: (d: boolean) => {
        set({ open: d });
      },
      toggle: () => {
        set({ open: !get().open });
      },
      setActiveSection: (d: MetadataPanelSection) => {
        set({ activeSection: d });
      },
      setSelectedDimension: (d: Component) => {
        set({ selectedDimension: d });
      },
      clearSelectedDimension: () => {
        set({ selectedDimension: undefined });
      },
      openDimension: (d: Component) => {
        set({ open: true, activeSection: "data", selectedDimension: d });
      },
      reset: () => {
        set({ activeSection: "general", selectedDimension: undefined });
      },
    },
  }));

export const useMetadataPanelStore: <T>(
  selector: (state: MetadataPanelState) => T
) => T = (selector) => {
  const store = useContext(MetadataPanelStoreContext);

  return useStore(store, selector, shallow);
};

export const useMetadataPanelStoreActions = () => {
  const store = useContext(MetadataPanelStoreContext);

  return useStore(store, (state) => state.actions);
};

const defaultStore = createMetadataPanelStore();

export const MetadataPanelStoreContext = createContext(defaultStore);
