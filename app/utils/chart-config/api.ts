import { InferAPIResponse } from "nextkit";

import { ConfiguratorStatePublishing } from "../../config-types";
import { apiFetch } from "../api";
import { createChartId } from "../create-chart-id";

import type apiConfigCreate from "../../pages/api/config-create";
import type apiConfigUpdate from "../../pages/api/config-update";
import type apiConfig from "../../pages/api/config/[key]";

export const createConfig = async (state: ConfiguratorStatePublishing) => {
  return apiFetch<InferAPIResponse<typeof apiConfigCreate, "POST">>(
    "/api/config-create",
    {
      method: "POST",
      data: {
        data: {
          // Create a new chart ID, as the one in the state could be already
          // used by a chart that has been published.
          key: createChartId(),
          version: state.version,
          dataSet: state.dataSet,
          dataSource: state.dataSource,
          meta: state.meta,
          chartConfigs: state.chartConfigs,
          activeChartKey: state.activeChartKey,
        },
      },
    }
  );
};

type UpdateConfigOptions = {
  key: string;
  userId: number;
};

export const updateConfig = async (
  state: ConfiguratorStatePublishing,
  options: UpdateConfigOptions
) => {
  const { key, userId } = options;

  return apiFetch<InferAPIResponse<typeof apiConfigUpdate, "POST">>(
    "/api/config-update",
    {
      method: "POST",
      data: {
        key,
        userId,
        data: {
          key,
          version: state.version,
          dataSet: state.dataSet,
          dataSource: state.dataSource,
          meta: state.meta,
          chartConfigs: state.chartConfigs,
          activeChartKey: state.activeChartKey,
        },
      },
    }
  );
};

export const fetchChartConfig = async (id: string) => {
  return await apiFetch<InferAPIResponse<typeof apiConfig, "GET">>(
    `/api/config/${id}`
  );
};
