import React from "react";
import create, { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";

import { ChartConfig, DataSource } from "@/configurator";
import { createChartId } from "@/utils/create-chart-id";

type State =
  | {
      step: "INITIAL";
      key: string;
    }
  | {
      step: "SELECTING_DATASET";
      key: string;
      dataSet: string;
      dataSource: DataSource;
    }
  | {
      step: "CONFIGURING_CHART";
      key: string;
      dataSet: string;
      dataSource: DataSource;
      chartConfigs: ChartConfig[];
      activeChartConfigKey: string;
      getParsedState: () => {
        key: string;
        dataSet: string;
        dataSource: DataSource;
        chartConfigs: ChartConfig[];
      };
    }
  | {
      step: "PUBLISHING";
    };

type ParsedState = {
  key: string;
};

type Actions = {
  actions: {};
};

const createConfiguratorStore = () => {
  return create<State & Actions>((set, get) => ({
    publishState: {
      // TODO: Rename method.
      key: createChartId(),
      dataSet: "",
      dataSource: {
        type: "sparql",
        url: "",
      },
    },
    editorState: {
      getActiveChartConfig: () => {
        const activeChartConfigKey = get().editorState.activeChartConfigKey;
        return get().publishState.chartConfigs.find(
          (d) => d.key === activeChartConfigKey
        ) as ChartConfig;
      },
    },
    actions: {},
  }));
};

const ConfiguratorContext = React.createContext<
  StoreApi<State & Actions> | undefined
>(undefined);

export const ConfiguratorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = createConfiguratorStore();

  return (
    <ConfiguratorContext.Provider value={store}>
      {children}
    </ConfiguratorContext.Provider>
  );
};

export const useConfigurator = () => {
  const ctx = React.useContext(ConfiguratorContext);

  if (!ctx) {
    throw new Error(
      "useConfigurator must be called inside a ConfiguratorProvider!"
    );
  }

  return useStore(ctx, (d) => d, shallow);
};

export const useConfiguratorState = () => {
  const ctx = React.useContext(ConfiguratorContext);

  if (!ctx) {
    throw new Error(
      "useConfiguratorState must be called inside a ConfiguratorProvider!"
    );
  }

  return useStore(
    ctx,
    (d) => ({ ...d.editorState, ...d.publishState }),
    shallow
  );
};

export const useConfiguratorActions = () => {
  const ctx = React.useContext(ConfiguratorContext);

  if (!ctx) {
    throw new Error(
      "useConfiguratorActions must be called inside a ConfiguratorProvider!"
    );
  }

  return useStore(ctx, (d) => d.actions, shallow);
};
