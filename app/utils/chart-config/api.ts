import { InferAPIResponse } from "nextkit";

import { ConfiguratorStatePublishing } from "../../config-types";
import { apiFetch } from "../api";

import type apiConfigs from "../../pages/api/config";
import type apiConfig from "../../pages/api/config/[key]";

export const createConfig = async (state: ConfiguratorStatePublishing) => {
  return apiFetch<InferAPIResponse<typeof apiConfigs, "POST">>("/api/config", {
    method: "POST",
    data: {
      data: {
        version: state.version,
        dataSet: state.dataSet,
        dataSource: state.dataSource,
        meta: state.meta,
        chartConfigs: state.chartConfigs,
        activeChartKey: state.activeChartKey,
      },
    },
  });
};

export const fetchChartConfig = async (id: string) => {
  return await apiFetch<InferAPIResponse<typeof apiConfig, "GET">>(
    `/api/config/${id}`
  );
};
