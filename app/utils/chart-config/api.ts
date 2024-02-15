import { PUBLISHED_STATE } from "@prisma/client";
import isUndefined from "lodash/isUndefined";
import omitBy from "lodash/omitBy";
import { InferAPIResponse } from "nextkit";

import { ParsedConfig } from "@/db/config";

import { ConfiguratorState } from "../../config-types";
import { apiFetch } from "../api";
import { createChartId } from "../create-chart-id";

import type apiConfigCreate from "../../pages/api/config-create";
import type apiConfigUpdate from "../../pages/api/config-update";
import type apiConfig from "../../pages/api/config/[key]";

export const createConfig = async (
  state: ConfiguratorState,
  publishedState: PUBLISHED_STATE
) => {
  return apiFetch<InferAPIResponse<typeof apiConfigCreate, "POST">>(
    "/api/config-create",
    {
      method: "POST",
      data: {
        data: {
          // Create a new chart ID, as the one in the state could be already
          // used by a chart that has been published.
          key: createChartId(),
          ...state,
        },
        publishedState: publishedState,
      },
    }
  );
};

type UpdateConfigOptions = {
  key: string;
  userId: number;
  published_state?: PUBLISHED_STATE;
};

export const updateConfig = async (
  state: ConfiguratorState,
  options: UpdateConfigOptions
) => {
  const { key, userId, published_state } = options;

  return apiFetch<InferAPIResponse<typeof apiConfigUpdate, "POST">>(
    "/api/config-update",
    {
      method: "POST",
      data: omitBy(
        {
          key,
          userId,
          data: {
            key,
            ...state,
          },
          published_state,
        },
        isUndefined
      ),
    }
  );
};

export const removeConfig = async (options: UpdateConfigOptions) => {
  const { key, userId } = options;

  return apiFetch<InferAPIResponse<typeof apiConfigUpdate, "POST">>(
    "/api/config-remove",
    {
      method: "POST",
      data: {
        key,
        userId,
      },
    }
  );
};

export const fetchChartConfig = async (id: string) => {
  return await apiFetch<InferAPIResponse<typeof apiConfig, "GET">>(
    `/api/config/${id}`
  );
};

export const fetchChartConfigs = async () => {
  return await apiFetch<ParsedConfig[]>(`/api/config/list`);
};
