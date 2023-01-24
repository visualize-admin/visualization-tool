import { InferAPIResponse } from "nextkit";

import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
} from "../../configurator/config-types";
import { apiFetch } from "../api";

import type apiConfigs from "../../pages/api/config";
import type apiConfig from "../../pages/api/config/[key]";

export const createChartConfigFromConfiguratorState = async (
  state: ConfiguratorStateConfiguringChart
) => {
  return apiFetch<InferAPIResponse<typeof apiConfigs, "POST">>("/api/config", {
    method: "POST",
    data: {
      isDraft: true,
      data: {
        dataSet: state.dataSet,
        dataSource: state.dataSource,
        meta: state.meta,
        chartConfig: state.chartConfig,
      },
    },
  });
};

export const fetchChartConfig = async (chartId: string) => {
  return await apiFetch<InferAPIResponse<typeof apiConfig, "GET">>(
    `/api/config/${chartId}`
  );
};

export const updateChartConfigFromConfiguratorState = async (
  key: string,
  state: ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing,
  isDraft: boolean
) => {
  return apiFetch<InferAPIResponse<typeof apiConfig, "PATCH">>(
    `/api/config/${key}`,
    {
      method: "PATCH",
      data: {
        dataSet: state.dataSet,
        dataSource: state.dataSource,
        meta: state.meta,
        chartConfig: state.chartConfig,
        isDraft,
      },
    }
  );
};
