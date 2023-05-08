import { InferAPIResponse } from "nextkit";

import { ConfiguratorStatePublishing } from "../../configurator/config-types";
import { apiFetch } from "../api";

import type apiConfigs from "../../pages/api/config";
import type apiConfig from "../../pages/api/config/[key]";

export const createConfig = async (state: ConfiguratorStatePublishing) => {
  return apiFetch<InferAPIResponse<typeof apiConfigs, "POST">>("/api/config", {
    method: "POST",
    data: {
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
