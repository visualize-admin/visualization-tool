import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";

import { Component } from "@/domain/data";

type MetadataPanelSection = "general" | "data";

type MetadataPanelState = {
  open: boolean;
  activeSection: MetadataPanelSection;
  selectedComponent: Component | undefined;
  actions: {
    setOpen: (open: boolean) => void;
    toggle: () => void;
    setActiveSection: (activeSection: MetadataPanelSection) => void;
    setSelectedComponent: (component: Component) => void;
    clearSelectedComponent: () => void;
    openComponent: (component: Component) => void;
    reset: () => void;
  };
};

export const createMetadataPanelStore = () =>
  createStore<MetadataPanelState>((set, get) => ({
    open: false,
    activeSection: "general",
    selectedComponent: undefined,
    actions: {
      setOpen: (open: boolean) => {
        set({ open });
      },
      toggle: () => {
        set({ open: !get().open });
      },
      setActiveSection: (section: MetadataPanelSection) => {
        set({ activeSection: section });
      },
      setSelectedComponent: (component: Component) => {
        set({ selectedComponent: component });
      },
      clearSelectedComponent: () => {
        set({ selectedComponent: undefined });
      },
      openComponent: (component: Component) => {
        set({
          open: true,
          activeSection: "data",
          selectedComponent: component,
        });
      },
      reset: () => {
        set({ activeSection: "general", selectedComponent: undefined });
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
