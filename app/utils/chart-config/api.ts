import { Config, PUBLISHED_STATE } from "@prisma/client";
import isUndefined from "lodash/isUndefined";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import { InferAPIResponse } from "nextkit";

import { ParsedConfig } from "@/db/config";

import { ConfiguratorState } from "../../config-types";
import { apiFetch } from "../api";
import { createChartId } from "../create-chart-id";

import type apiConfigCreate from "../../pages/api/config-create";
import type apiConfigUpdate from "../../pages/api/config-update";
import type apiConfig from "../../pages/api/config/[key]";

type CreateConfigOptions = {
  key?: string;
  user_id?: number;
  published_state?: PUBLISHED_STATE;
  data: ConfiguratorState;
};

type UpdateConfigOptions = {
  key: string;
  published_state?: PUBLISHED_STATE;
  data: ConfiguratorState;
};

const prepareForServer = (configState: Partial<Config>) => {
  return omitBy(
    {
      ...configState,
      data:
        "data" in configState
          ? omit(configState["data"] as {}, ["state"])
          : undefined,
    },
    isUndefined
  );
};

export const createConfig = async (options: CreateConfigOptions) => {
  return apiFetch<InferAPIResponse<typeof apiConfigCreate, "POST">>(
    "/api/config-create",
    {
      method: "POST",
      data: prepareForServer({
        data: {
          // Create a new chart ID, as the one in the state could be already
          // used by a chart that has been published.
          key: createChartId(),
          ...options.data,
        },
        user_id: options.user_id,
        published_state: options.published_state,
      }),
    }
  );
};

export const updateConfig = async (options: UpdateConfigOptions) => {
  const { key, published_state } = options;

  return apiFetch<InferAPIResponse<typeof apiConfigUpdate, "POST">>(
    "/api/config-update",
    {
      method: "POST",
      data: prepareForServer({
        key,
        data: {
          key,
          ...options.data,
        },
        published_state,
      }),
    }
  );
};

export const removeConfig = async (options: { key: string }) => {
  const { key } = options;

  return apiFetch<InferAPIResponse<typeof apiConfigUpdate, "POST">>(
    "/api/config-remove",
    {
      method: "POST",
      data: {
        key,
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
