import { Config, PUBLISHED_STATE } from "@prisma/client";
import isUndefined from "lodash/isUndefined";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import { InferAPIResponse } from "nextkit";

import { ParsedConfig } from "@/db/config";

import { ConfiguratorState, CustomPaletteType } from "../../config-types";
import { apiFetch } from "../api";
import { createId } from "../create-id";

import type apiConfig from "../../pages/api/config/[key]";
import type apiConfigCreate from "../../pages/api/config-create";
import type apiConfigUpdate from "../../pages/api/config-update";
import type apiUserColorPalette from "../../pages/api/user/color-palette";

export type CreateCustomColorPalette = Omit<CustomPaletteType, "paletteId">;
export type UpdateCustomColorPalette = Partial<
  Omit<CustomPaletteType, "paletteId">
> &
  Pick<CustomPaletteType, "paletteId">;
export type DeleteCustomColorPalette = Pick<CustomPaletteType, "paletteId">;

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
          key: createId(),
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

export const createCustomColorPalette = async (
  options: CreateCustomColorPalette
) => {
  return (await apiFetch<InferAPIResponse<typeof apiUserColorPalette, "POST">>(
    "/api/user/color-palette",
    {
      method: "POST",
      data: options,
    }
  )) as unknown as CustomPaletteType;
};

export const getCustomColorPalettes = async (): Promise<
  CustomPaletteType[]
> => {
  return (await apiFetch<InferAPIResponse<typeof apiUserColorPalette, "GET">>(
    "/api/user/color-palette",
    {
      method: "GET",
    }
  )) as CustomPaletteType[];
};

export const deleteCustomColorPalette = async (
  options: DeleteCustomColorPalette
) => {
  await apiFetch<InferAPIResponse<typeof apiUserColorPalette, "DELETE">>(
    "/api/user/color-palette",
    {
      method: "DELETE",
      data: options,
    }
  );
};

export const updateCustomColorPalette = async (
  options: UpdateCustomColorPalette
) => {
  await apiFetch<InferAPIResponse<typeof apiUserColorPalette, "PUT">>(
    "/api/user/color-palette",
    {
      method: "PUT",
      data: options,
    }
  );
};
